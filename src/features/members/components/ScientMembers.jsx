import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Rocket, ChevronDown } from 'lucide-react';
import MemberCard from './MemberCard';
import FacultyAdvisorCard from './FacultyAdvisor.jsx';
import FacilityAdminCard from './FacilityAdmin.jsx';
import { MOCK_TEAM_MEMBERS, MOCK_PRINCE_ADVISOR } from '../data/mockTeamMembers';
import '../styles/ScientMembers.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const SCIENT_YEARS = ['26-27', '25-26', '24-25'];

const DEPARTMENTS = ['Core', 'Corporate Communications', 'DevOps', 'Creatives', 'Project Management'];

// Roles per department when a specific dept is selected.
// Core is a flat list (no roles). Project Management: Senior Managers only.
// For all others: Senior Managers (= Senior Manager + Project Manager roles), Managers, Deputy Managers.
const DEPT_ROLES = {
  'Core':                    null, // flat grid, no role sections
  'Corporate Communications': ['Senior Manager', 'Manager', 'Deputy Manager'],
  'DevOps':                   ['Senior Manager', 'Manager', 'Deputy Manager'],
  'Creatives':                ['Senior Manager', 'Manager', 'Deputy Manager'],
  'Project Management':       ['Senior Manager'],
};

// In the complete-team view (no dept selected), these 4 sections are shown:
//   "Core"            → subteam === 'Core' (flat)
//   "Senior Managers" → role === 'Senior Manager' OR role === 'Project Manager'  (all non-Core depts)
//   "Managers"        → role === 'Manager'        (all non-Core depts)
//   "Deputy Managers" → role === 'Deputy Manager' (all non-Core depts)
const COMPLETE_SECTIONS = ['Core', 'Senior Managers', 'Managers', 'Deputy Managers'];

// ─── Static fallback Admin cards ─────────────────────────────────────────────

const dummyBakthavatsalam = {
  _id: 'advisor-baktha',
  name: 'Dr. A. K. Bakthavatsalam',
  role: 'Faculty Advisor',
  Department: 'Energy & Environment Engineering',
  photoUrl: '/Team/Dr_A_K_Bakthavatsalam.png',
  email: 'baktha@nitt.edu',
  description: 'Guiding research, innovation, and strategic initiatives at SCIEnT',
  linkedin: 'https://www.linkedin.com/company/scientnitt/',
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
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Normalise subteam label (DB may store singular form)
const normSubteam = s =>
  s === 'Corporate Communication' ? 'Corporate Communications' : s;

// Is this member in the Core subteam?
const isCoreMember = m =>
  m.subteam === 'Core' || m.subteam === 'Cores' || m.role === 'Core';

// Filter members for a specific year + dept + role(s).
// roles is an array; if null → return all members of that dept (flat Core).
const getMembers = (all, year, dept, roles) =>
  all
    .filter(m => {
      if (m.year !== year) return false;
      if (dept === 'Core') return isCoreMember(m);
      if (normSubteam(m.subteam) !== dept) return false;
      if (roles === null) return true;
      return roles.includes(m.role);
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// For "Senior Managers" section in complete view:
// includes role === 'Senior Manager' OR role === 'Project Manager' across all non-Core depts.
const getSeniorManagersAll = (all, year) =>
  all
    .filter(m => {
      if (m.year !== year) return false;
      if (isCoreMember(m)) return false;
      return m.role === 'Senior Manager' || m.role === 'Project Manager';
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// For "Managers" / "Deputy Managers" in complete view (all non-Core depts).
const getRoleAll = (all, year, role) =>
  all
    .filter(m => m.year === year && !isCoreMember(m) && m.role === role)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// For dept view: Senior Managers section = Senior Manager + Project Manager roles
const getSeniorManagersDept = (all, year, dept) =>
  all
    .filter(m => {
      if (m.year !== year) return false;
      if (normSubteam(m.subteam) !== dept) return false;
      return m.role === 'Senior Manager' || m.role === 'Project Manager';
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

// For dept view: Managers / Deputy Managers
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

// ─── Component ───────────────────────────────────────────────────────────────

const SCIentMembers = () => {
  // 26-27 selected by default; no department selected by default
  const [selectedYear, setSelectedYear] = useState('26-27');
  const [selectedDept, setSelectedDept] = useState(null); // null = show complete team
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);
  const [allMembers,   setAllMembers]   = useState([]);
  const [loading,      setLoading]      = useState(true);

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
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/team'
      : '/api/team';

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/all`);
        let fetched = res.data.data || [];
        if (fetched.length === 0 && process.env.NODE_ENV !== 'production') {
          fetched = MOCK_TEAM_MEMBERS;
        }
        setAllMembers(fetched);
      } catch {
        if (process.env.NODE_ENV !== 'production') {
          setAllMembers(MOCK_TEAM_MEMBERS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [API_BASE]);

  // ── Admin cards ────────────────────────────────────────────────────────────
  const dbAdvisors = allMembers.filter(m => m.role === 'Faculty Advisor');
  const dbAdmin    = allMembers.find(m => m.role === 'Admin Executive');

  let facultyAdvisors = [...dbAdvisors];
  if (!facultyAdvisors.some(a => a.name.includes('Bakthavatsalam')))
    facultyAdvisors.unshift(dummyBakthavatsalam);
  if (!facultyAdvisors.some(a => a.name.includes('Prince')))
    facultyAdvisors.push(MOCK_PRINCE_ADVISOR);

  const facilityAdmin = dbAdmin || dummySivanesan;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleYearClick = year => {
    setSelectedYear(year);
    // keep selectedDept as-is so the user's department filter persists across years
  };

  const handleDeptClick = dept => {
    // clicking the already-selected dept deselects it (returns to complete view)
    setSelectedDept(prev => (prev === dept ? null : dept));
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#facc15] text-xl font-mono animate-pulse">Loading SCIEnT Team…</div>
      </div>
    );
  }

  // ── Derived data for current view ──────────────────────────────────────────
  const showCompleteTeam = selectedDept === null;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
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

      {/* ══ SCIEnT Admin (always visible) ════════════════════════════════════ */}
      <div className="AdminSection mb-16 px-4">
        <div className="flex justify-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-[#facc15]">SCIEnT Admin</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {facultyAdvisors.map((advisor, idx) => (
            <FacultyAdvisorCard key={advisor._id || idx} AdvisorData={advisor} />
          ))}
          <FacilityAdminCard adminData={facilityAdmin} />
        </div>
      </div>

      {/* ══ Student Team ══════════════════════════════════════════════════════ */}
      <div className="relative max-w-6xl mx-auto px-4 pb-24">

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

        {/* ── Department filter buttons ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {DEPARTMENTS.map(dept => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => handleDeptClick(dept)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 border tabs ${
                  isActive
                    ? 'bg-[#facc15] text-black border-[#facc15] font-bold'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-[#facc15]/60 hover:text-white'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* ── Member sections ────────────────────────────────────────────────── */}
        <div className="space-y-14">

          {/* ── COMPLETE TEAM VIEW (no dept selected) ──────────────────────── */}
          {showCompleteTeam && (() => {
            const coreMembers    = getMembers(allMembers, selectedYear, 'Core', null);
            const seniorManagers = getSeniorManagersAll(allMembers, selectedYear);
            const managers       = getRoleAll(allMembers, selectedYear, 'Manager');
            const deputies       = getRoleAll(allMembers, selectedYear, 'Deputy Manager');
            const anyMembers     = coreMembers.length + seniorManagers.length + managers.length + deputies.length > 0;

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
                  Use the Admin panel to add members.
                </p>
              </div>
            );
          })()}

          {/* ── DEPARTMENT VIEW (specific dept selected) ────────────────────── */}
          {!showCompleteTeam && (() => {
            if (selectedDept === 'Core') {
              // Core: flat grid
              const members = getMembers(allMembers, selectedYear, 'Core', null);
              return members.length > 0 ? (
                <div className="membersGrid">
                  {members.map((m, idx) => (
                    <MemberCard key={m._id || idx} member={m} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8">
                  <p className="text-zinc-400 text-sm">
                    No Core members for Team of{' '}
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
            // Senior Managers (SM + PM roles), Managers, Deputy Managers
            const seniors  = getSeniorManagersDept(allMembers, selectedYear, selectedDept);
            const managers = getRoleDept(allMembers, selectedYear, selectedDept, 'Manager');
            const deputies = getRoleDept(allMembers, selectedYear, selectedDept, 'Deputy Manager');
            const anyMems  = seniors.length + managers.length + deputies.length > 0;

            return anyMems ? (
              <>
                <RoleSection title="Senior Managers" members={seniors} />
                <RoleSection title="Managers"        members={managers} />
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