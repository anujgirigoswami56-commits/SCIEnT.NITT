import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Rocket, ChevronDown, AlertTriangle } from 'lucide-react';
import MemberCard from './MemberCard';
import FacultyAdvisorCard from './FacultyAdvisor.jsx';
import FacilityAdminCard from './FacilityAdmin.jsx';
import { MOCK_TEAM_MEMBERS, MOCK_PRINCE_ADVISOR } from '../data/mockTeamMembers';
import '../styles/ScientMembers.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const SCIENT_YEARS = ['24-25', '25-26', '26-27'];

const CATEGORIES = [
  { id: 'Core', label: 'Core' },
  { id: 'Corporate Communications', label: 'Corporate Communications (CC)' },
  { id: 'DevOps', label: 'DevOps' },
  { id: 'Creatives', label: 'Creatives' },
  { id: 'Project Management', label: 'Project Management' },
];

// ─── Static fallback Admin details ───────────────────────────────────────────

const dummyBakthavatsalam = {
  _id: 'advisor-baktha',
  name: 'Dr. A. K. Bakthavatsalam',
  role: 'Faculty Advisor',
  Department: 'Energy & Environment Engineering',
  photoUrl: '/Team/Dr_A_K_Bakthavatsalam.png',
  email: 'baktha@nitt.edu',
  description: 'Guiding research, innovation, and strategic initiatives at SCIEnT',
  linkedin: 'https://www.linkedin.com/company/scientnitt/',
  cardColor: '#facc15',
};

const dummySivanesan = {
  _id: 'admin-sivanesan',
  name: 'Mr. Sivanesan S',
  role: 'Admin Executive',
  Department: 'SCIEnT Facility Operations',
  photoUrl: '/Team/Sivaneshan.jpg',
  email: 'sivaneshan@nitt.edu',
  description: 'Overseeing facility management and operational excellence at SCIEnT',
  linkedin: 'https://www.linkedin.com/company/scientnitt/',
  cardColor: '#facc15',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Normalise subteam label (DB may store singular form or 'Cores')
const normSubteam = s => {
  if (!s) return '';
  if (s === 'Corporate Communication') return 'Corporate Communications';
  if (s === 'Cores') return 'Core';
  return s;
};

// Is this member in the Core subteam?
const isCoreMember = m =>
  m.subteam === 'Core' ||
  m.subteam === 'Cores' ||
  m.role === 'Core' ||
  (m.subteam === null && m.role?.endsWith('Executive') && m.role !== 'Admin Executive');

// Filter Core members for a specific year
const getCoreMembers = (all, year) =>
  all
    .filter(m => m.year === year && isCoreMember(m))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// Filter Senior Managers across all depts (includes Project Managers)
const getSeniorManagersAll = (all, year) =>
  all
    .filter(m => {
      if (m.year !== year) return false;
      if (isCoreMember(m)) return false;
      return m.role === 'Senior Manager' || m.role === 'Project Manager';
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// Filter by role across all non-Core depts
const getRoleAll = (all, year, role) =>
  all
    .filter(m => m.year === year && !isCoreMember(m) && m.role === role)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// Filter Senior Managers for a specific department
const getSeniorManagersDept = (all, year, dept) =>
  all
    .filter(m => {
      if (m.year !== year) return false;
      if (normSubteam(m.subteam) !== dept) return false;
      return m.role === 'Senior Manager' || m.role === 'Project Manager';
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// Filter by specific role in a specific department
const getRoleDept = (all, year, dept, role) =>
  all
    .filter(m => m.year === year && normSubteam(m.subteam) === dept && m.role === role)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// ─── RoleSection sub-component ───────────────────────────────────────────────

const RoleSection = ({ title, members }) => {
  if (!members || members.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-[#facc15]/20" />
        <h3 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase text-[#facc15]">
          {title}
        </h3>
        <div className="h-px flex-1 bg-[#facc15]/20" />
      </div>
      <div className="membersGrid">
        {members.map((member, idx) => (
          <MemberCard key={member._id || idx} member={member} index={idx} />
        ))}
      </div>
    </section>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const SCIentMembers = () => {
  // 26-27 selected initially; no category selected initially
  const [selectedYear, setSelectedYear] = useState('26-27');
  const [selectedDept, setSelectedDept] = useState(null); // null = show complete team
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/team'
      : '/api/team');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setApiError(null);
        let res;
        try {
          res = await axios.get(`${API_BASE}/all`, { timeout: 6000 });
        } catch (firstErr) {
          // If port 5000 or relative endpoint failed, try the alternate endpoint
          const altEndpoint = API_BASE.includes('localhost:5000')
            ? '/api/team/all'
            : 'http://localhost:5000/api/team/all';
          res = await axios.get(altEndpoint, { timeout: 6000 });
        }
        const fetched = res.data.data || [];
        if (fetched.length > 0) {
          setAllMembers(fetched);
          setApiError(null);
        } else {
          setAllMembers(MOCK_TEAM_MEMBERS);
        }
      } catch (err) {
        console.error('Failed to fetch team members from API:', err);
        setApiError('Unable to reach server. Displaying cached member directory.');
        setAllMembers(MOCK_TEAM_MEMBERS);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [API_BASE]);

  // ── Admin cards ────────────────────────────────────────────────────────────
  const bakthaFromDb = allMembers.find(
    m => m.role === 'Faculty Advisor' && m.name && m.name.includes('Bakthavatsalam')
  );
  const bakthaData = bakthaFromDb
    ? { ...dummyBakthavatsalam, ...bakthaFromDb, photoUrl: bakthaFromDb.photoUrl || dummyBakthavatsalam.photoUrl }
    : dummyBakthavatsalam;

  const sivaFromDb = allMembers.find(
    m => (m.role === 'Admin Executive' || (m.name && m.name.includes('Sivanesan')))
  );
  const facilityAdmin = sivaFromDb
    ? { ...dummySivanesan, ...sivaFromDb, photoUrl: sivaFromDb.photoUrl || dummySivanesan.photoUrl }
    : dummySivanesan;

  const princeFromDb = allMembers.find(
    m => m.role === 'Faculty Advisor' && m.name && m.name.includes('Prince')
  );
  const princeData = princeFromDb
    ? { ...MOCK_PRINCE_ADVISOR, ...princeFromDb, photoUrl: princeFromDb.photoUrl || MOCK_PRINCE_ADVISOR.photoUrl }
    : MOCK_PRINCE_ADVISOR;

  const facultyAdvisors = [bakthaData, princeData];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleYearClick = year => {
    setSelectedYear(year);
  };

  const handleDeptClick = dept => {
    // clicking the already-selected category deselects it (returns to complete team view)
    setSelectedDept(prev => (prev === dept ? null : dept));
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#facc15] text-xl font-mono animate-pulse">Loading SCIEnT Team…</div>
      </div>
    );
  }

  // ── Derived view state ─────────────────────────────────────────────────────
  const showCompleteTeam = selectedDept === null;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div
          className="absolute w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* ══ Hero ══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-20 pb-12 px-4 text-center">
        <div className="inline-block mb-3">
          <Rocket className="w-14 h-14 text-[#facc15] animate-bounce" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-3 text-[#facc15] tracking-tight">
          THE SQUAD
        </h1>
        <p className="text-lg md:text-xl text-[#facc15]/80 max-w-2xl mx-auto">
          Meet the minds behind <span className="text-[#facc15] font-bold">SCIEnT</span>
        </p>
        <p className="text-xs md:text-sm text-[#facc15]/60 mt-1">
          Student Centre for Innovation in Engineering and Technology
        </p>
      </div>

      {/* API Error Banner if any */}
      {apiError && (
        <div className="max-w-2xl mx-auto mb-8 px-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{apiError} (Showing cached preview)</span>
          </div>
        </div>
      )}

      {/* ══ SCIEnT Admin (always visible) ════════════════════════════════════ */}
      <div className="AdminSection mb-16 px-4">
        <div className="flex justify-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-[#facc15]">SCIEnT Admin</h2>
        </div>

        {/* Row 1 — Bakthavatsalam (left) · Sivanesan (right) */}
        <div className="adminGrid">
          <FacultyAdvisorCard AdvisorData={facultyAdvisors[0]} />
          <FacilityAdminCard adminData={facilityAdmin} />
        </div>

        {/* Row 2 — Prince centered below */}
        <div className="adminGrid__prince">
          <div className="adminGrid__prince-card">
            <FacultyAdvisorCard AdvisorData={facultyAdvisors[1]} />
          </div>
        </div>
      </div>

      {/* ══ Student Team ══════════════════════════════════════════════════════ */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#facc15]">SCIEnT Student Team</h2>
        </div>

        {/* ── Year dropdown menu ────────────────────────────────────────────── */}
        <div className="flex justify-center mb-10 relative z-30">
          <div className="relative inline-block text-left" ref={yearDropdownRef}>
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen(prev => !prev)}
              className="flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-lg md:text-xl transition-all duration-300 border-2 border-[#facc15] bg-[#facc15] text-black hover:bg-[#facc15]/90 active:scale-95 cursor-pointer shadow-lg shadow-[#facc15]/10"
              aria-haspopup="true"
              aria-expanded={isYearDropdownOpen}
            >
              <span>Team of {selectedYear}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isYearDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-zinc-950 border-2 border-[#facc15]/60 rounded-2xl shadow-2xl shadow-black/80 py-2 z-50 backdrop-blur-xl overflow-hidden animate-in fade-in duration-150">
                {SCIENT_YEARS.map(year => {
                  const isSelected = selectedYear === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        handleYearClick(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 font-semibold text-base transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#facc15] text-black font-bold'
                          : 'text-zinc-200 hover:bg-[#facc15]/15 hover:text-[#facc15]'
                      }`}
                    >
                      <span>Team of {year}</span>
                      {isSelected && (
                        <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Category selector buttons ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {CATEGORIES.map(cat => {
            const isActive = selectedDept === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleDeptClick(cat.id)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 border tabs cursor-pointer ${
                  isActive
                    ? 'bg-[#facc15] text-black border-[#facc15] font-bold shadow-lg shadow-[#facc15]/20'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-[#facc15]/60 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Member sections ────────────────────────────────────────────────── */}
        <div className="space-y-14">

          {/* ── COMPLETE TEAM VIEW (no dept selected) ──────────────────────── */}
          {showCompleteTeam && (() => {
            const coreMembers = getCoreMembers(allMembers, selectedYear);
            const seniorManagers = getSeniorManagersAll(allMembers, selectedYear);
            const managers = getRoleAll(allMembers, selectedYear, 'Manager');
            const deputies = getRoleAll(allMembers, selectedYear, 'Deputy Manager');
            const anyMembers = coreMembers.length + seniorManagers.length + managers.length + deputies.length > 0;

            return anyMembers ? (
              <>
                {/* Core — flat grid */}
                {coreMembers.length > 0 && (
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-[#facc15]/20" />
                      <h3 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase text-[#facc15]">
                        Core
                      </h3>
                      <div className="h-px flex-1 bg-[#facc15]/20" />
                    </div>
                    <div className="membersGrid">
                      {coreMembers.map((m, idx) => (
                        <MemberCard key={m._id || idx} member={m} index={idx} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Senior Managers (includes Project Managers) */}
                <RoleSection title="Senior Managers" members={seniorManagers} />
                {/* Managers */}
                <RoleSection title="Managers" members={managers} />
                {/* Deputy Managers */}
                <RoleSection title="Deputy Managers" members={deputies} />
              </>
            ) : (
              <div className="text-center py-16 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8">
                <p className="text-zinc-400 text-sm">
                  No members added yet for Team of{' '}
                  <span className="text-[#facc15] font-semibold">{selectedYear}</span>.
                </p>
                <p className="text-zinc-600 text-xs mt-2">
                  Use the Admin panel to add members for this academic year.
                </p>
              </div>
            );
          })()}

          {/* ── DEPARTMENT VIEW (specific category selected) ───────────────── */}
          {!showCompleteTeam && (() => {
            if (selectedDept === 'Core') {
              // Core: flat grid
              const members = getCoreMembers(allMembers, selectedYear);
              return members.length > 0 ? (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-[#facc15]/20" />
                    <h3 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase text-[#facc15]">
                      Core
                    </h3>
                    <div className="h-px flex-1 bg-[#facc15]/20" />
                  </div>
                  <div className="membersGrid">
                    {members.map((m, idx) => (
                      <MemberCard key={m._id || idx} member={m} index={idx} />
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-center py-16 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8">
                  <p className="text-zinc-400 text-sm">
                    No Core members found for Team of{' '}
                    <span className="text-[#facc15] font-semibold">{selectedYear}</span>.
                  </p>
                </div>
              );
            }

            if (selectedDept === 'Project Management') {
              // Project Management: Senior Managers ONLY
              const seniors = getSeniorManagersDept(allMembers, selectedYear, 'Project Management');
              return seniors.length > 0 ? (
                <RoleSection title="Senior Managers" members={seniors} />
              ) : (
                <div className="text-center py-16 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8">
                  <p className="text-zinc-400 text-sm">
                    No Project Management members for Team of{' '}
                    <span className="text-[#facc15] font-semibold">{selectedYear}</span>.
                  </p>
                </div>
              );
            }

            // Corporate Communications / DevOps / Creatives:
            // Senior Managers, Managers, Deputy Managers
            const seniors = getSeniorManagersDept(allMembers, selectedYear, selectedDept);
            const managers = getRoleDept(allMembers, selectedYear, selectedDept, 'Manager');
            const deputies = getRoleDept(allMembers, selectedYear, selectedDept, 'Deputy Manager');
            const anyMems = seniors.length + managers.length + deputies.length > 0;

            return anyMems ? (
              <>
                <RoleSection title="Senior Managers" members={seniors} />
                <RoleSection title="Managers" members={managers} />
                <RoleSection title="Deputy Managers" members={deputies} />
              </>
            ) : (
              <div className="text-center py-16 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8">
                <p className="text-zinc-400 text-sm">
                  No members for{' '}
                  <span className="text-[#facc15] font-semibold">{selectedDept}</span>{' '}
                  in Team of {selectedYear}.
                </p>
                <p className="text-zinc-600 text-xs mt-2">
                  Use the Admin panel to add members to this department.
                </p>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default SCIentMembers;