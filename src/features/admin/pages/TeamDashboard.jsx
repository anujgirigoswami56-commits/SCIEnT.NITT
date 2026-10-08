import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Search, LogOut, Users, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const TeamDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [subteamFilter, setSubteamFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { token, logout, API_BASE } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/team/all`);
      const data = response.data.data || [];
      setMembers(data);
    } catch (error) {
      toast.error('Failed to fetch team members from database');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/team/${memberToDelete._id || memberToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Member deleted successfully');
      setShowDeleteModal(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filter constants (shown in search/filter dropdowns only) ────────────────
  const FILTER_ROLES = [
    'Faculty Advisor',
    'Core',
    'Ex-Core',
    'Senior Manager',
    'Manager',
    'Deputy Manager',
    'Ex-Manager',
    'Senior Project Manager',
    'Project Manager',
    'Admin Executive',
    'Technical Executive',
    'Facility Executive',
    'External Affairs Executive',
    'Internal Affairs Executive',
    'Project Operations Executive',
  ];

  const FILTER_SUBTEAMS = [
    'Cores',
    'Project Management',
    'DevOps',
    'Corporate Communications',
    'Creatives',
  ];

  const SCIENT_YEARS = ['26-27', '25-26', '24-25'];

  // ─── Filter logic ─────────────────────────────────────────────────────────────
  const filteredMembers = members.filter(member => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (member.name || '').toLowerCase().includes(searchLower) ||
      (member.role || '').toLowerCase().includes(searchLower) ||
      (member.subteam || '').toLowerCase().includes(searchLower) ||
      (member.email || '').toLowerCase().includes(searchLower);
    const matchesRole    = roleFilter    ? member.role    === roleFilter    : true;
    const matchesSubteam = subteamFilter ? member.subteam === subteamFilter : true;
    const matchesYear    = yearFilter
      ? (yearFilter === 'none' ? !member.year : member.year === yearFilter)
      : true;
    return matchesSearch && matchesRole && matchesSubteam && matchesYear;
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-yellow-400 w-8 h-8" />
            Team <span className="text-yellow-400">Management</span>
          </h1>
          <p className="text-zinc-400 mt-1">Manage team members and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/team/new" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl w-full sm:w-fit gap-1 backdrop-blur-sm">
        <Link 
          to="/admin/team"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/team') 
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Team Members
        </Link>
        <Link 
          to="/admin/projects"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/projects') 
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Projects & Clubs
        </Link>
        <Link 
          to="/admin/settings"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/settings') 
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Timeline Settings
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          {/* Name / text search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, role, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
            />
          </div>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full md:w-40 px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
          >
            <option value="">All Years</option>
            {SCIENT_YEARS.map(y => <option key={y} value={y}>Team of {y}</option>)}
            <option value="none">Faculty / Admin</option>
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-52 px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
          >
            <option value="">All Roles</option>
            {FILTER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Sub-team filter */}
          <select
            value={subteamFilter}
            onChange={(e) => setSubteamFilter(e.target.value)}
            className="w-full md:w-52 px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
          >
            <option value="">All Sub-teams</option>
            {FILTER_SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Clear all filters */}
          {(search || roleFilter || subteamFilter || yearFilter) && (
            <button
              onClick={() => { setSearch(''); setRoleFilter(''); setSubteamFilter(''); setYearFilter(''); }}
              className="shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No members found</h3>
            <p className="text-zinc-400">Adjust your search filters or add a new team member.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <div key={member._id || member.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group hover:border-yellow-400/50 transition-colors">
                <div className="h-48 overflow-hidden bg-zinc-950 flex items-center justify-center relative">
                  {member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                    />
                  ) : (
                    <Users className="w-16 h-16 text-zinc-800" />
                  )}
                  {/* Action Overlay */}
                  <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-black/80 to-transparent w-full justify-end">
                    <Link 
                      to={`/admin/team/edit/${member._id || member.id}`}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-lg backdrop-blur-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => {
                        setMemberToDelete(member);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
                    <span 
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: member.cardColor || '#facc15' }}
                      title={`Card Accent: ${member.cardColor || '#facc15'}`}
                    ></span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span 
                      className="px-2 py-1 text-xs rounded-md border font-medium"
                      style={{
                        backgroundColor: `${member.cardColor || '#facc15'}18`,
                        color: member.cardColor || '#facc15',
                        borderColor: `${member.cardColor || '#facc15'}40`
                      }}
                    >
                      {member.role}
                    </span>
                    {member.subteam && (
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md border border-zinc-700">
                        {member.subteam}
                      </span>
                    )}
                  </div>
                  {member.email && <p className="text-zinc-500 text-sm mt-auto truncate">{member.email}</p>}
                  {member.year && (
                    <span className="mt-2 inline-block px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded border border-zinc-700 font-mono">
                      Team {member.year}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Member</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{memberToDelete?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
