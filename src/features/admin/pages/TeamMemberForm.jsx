import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import MemberCard from '../../members/components/MemberCard';
import HexagonColorPicker from '../../../components/HexagonColorPicker';

// Standard SCIEnT team years. Add new years here as needed.
const SCIENT_YEARS = ['26-27', '25-26', '24-25'];

// ── Roles per sub-team (used when adding/editing a member) ──────────────────
// NOTE: These must exactly match the enum values in server/models/TeamMember.js
const ROLES_BY_SUBTEAM = {
  Cores: [
    'External Affairs Executive',
    'Internal Affairs Executive',
    'Technical Executive',
    'Facility Executive',
    'Project Operations Executive',
    'Core',
    'Ex-Core',
  ],
  'Project Management': [
    'Senior Project Manager',
    'Project Manager',
    'Senior Manager',
  ],
  'Corporate Communications': [
    'Senior Manager',
    'Manager',
    'Deputy Manager',
    'Ex-Manager',
  ],
  DevOps: [
    'Senior Manager',
    'Manager',
    'Deputy Manager',
    'Ex-Manager',
  ],
  Creatives: [
    'Senior Manager',
    'Manager',
    'Deputy Manager',
    'Ex-Manager',
  ],
};

// Fallback — shown when no sub-team is selected yet
const ALL_ADD_ROLES = [
  'Senior Manager',
  'Manager',
  'Deputy Manager',
  'Senior Project Manager',
  'Project Manager',
  'External Affairs Executive',
  'Internal Affairs Executive',
  'Technical Executive',
  'Facility Executive',
  'Project Operations Executive',
  'Faculty Advisor',
  'Admin Executive',
  'Core',
  'Ex-Core',
  'Ex-Manager',
];

// Sub-team options for the add/edit form
// NOTE: These must exactly match the enum values in server/models/TeamMember.js
const ADD_SUBTEAMS = [
  'Cores',
  'Project Management',
  'DevOps',
  'Corporate Communications',
  'Creatives',
];

const TeamMemberForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { token, API_BASE } = useAuth();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    subteam: '',
    Department: '',
    photoUrl: '',
    linkedin: '',
    instagram: '',
    email: '',
    year: '',
    description: '',
    order: 0,
    cardColor: '#facc15'
  });

  // Dynamically compute which roles are available based on the currently selected sub-team.
  const availableRoles = formData.subteam && ROLES_BY_SUBTEAM[formData.subteam]
    ? ROLES_BY_SUBTEAM[formData.subteam]
    : ALL_ADD_ROLES;

  useEffect(() => {
    if (isEditMode) {
      const fetchMember = async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/team/${id}`);
          const data = response.data.data || response.data;

          const sanitizedData = {};
          Object.keys(formData).forEach(key => {
            sanitizedData[key] = data[key] !== null && data[key] !== undefined
              ? data[key]
              : (key === 'cardColor' ? '#facc15' : '');
          });

          setFormData(sanitizedData);

          // If existing member has a photoUrl, show it as the current image preview
          if (data.photoUrl) {
            setImagePreview(data.photoUrl);
          }
        } catch (error) {
          toast.error('Failed to fetch member details');
          navigate('/admin/team');
        } finally {
          setLoading(false);
        }
      };
      fetchMember();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, navigate, API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // When sub-team changes, reset role if it's no longer valid for the new sub-team
      if (name === 'subteam') {
        const validRoles = ROLES_BY_SUBTEAM[value] || ALL_ADD_ROLES;
        if (updated.role && !validRoles.includes(updated.role)) {
          updated.role = '';
        }
      }
      return updated;
    });
  };

  // ─── Image handling ───────────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    setImageFile(file);
    // Show local preview immediately while the user decides to upload
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', imageFile); // field name must match multer's .single('image')

      const qParams = [];
      if (formData.year) qParams.push(`year=${encodeURIComponent(formData.year)}`);
      if (id) qParams.push(`memberId=${encodeURIComponent(id)}`);
      const qs = qParams.length ? `?${qParams.join('&')}` : '';

      const response = await axios.post(`${API_BASE}/api/team/upload-image${qs}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const firebaseUrl = response.data.data.url;
        setFormData(prev => ({ ...prev, photoUrl: firebaseUrl }));
        setImagePreview(firebaseUrl); // now preview shows the Firebase Storage URL
        setImageFile(null);           // clear the local file — it's already uploaded
        toast.success('Image uploaded to Firebase Storage successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Form submit ──────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.role) {
      toast.error('Name and Role are required');
      return;
    }

    let finalPhotoUrl = formData.photoUrl;
    // Auto-upload image to Firebase if a new file is selected
    if (imageFile) {
      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const qParams = [];
        if (formData.year) qParams.push(`year=${encodeURIComponent(formData.year)}`);
        if (id) qParams.push(`memberId=${encodeURIComponent(id)}`);
        const qs = qParams.length ? `?${qParams.join('&')}` : '';

        const uploadRes = await axios.post(`${API_BASE}/api/team/upload-image${qs}`, uploadFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data.success && uploadRes.data.data?.url) {
          finalPhotoUrl = uploadRes.data.data.url;
          setFormData(prev => ({ ...prev, photoUrl: finalPhotoUrl }));
          setImagePreview(finalPhotoUrl);
          setImageFile(null);
        } else {
          toast.error('Image upload to Firebase failed');
          setUploading(false);
          return;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload image to Firebase Storage');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    setSaving(true);
    try {
      const payload = { ...formData, photoUrl: finalPhotoUrl || null };
      if (payload.subteam === '') payload.subteam = null;
      if (payload.order !== '') payload.order = Number(payload.order) || 0;
      if (payload.year === '') payload.year = null;

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEditMode) {
        await axios.put(`${API_BASE}/api/team/${id}`, payload, config);
        toast.success('Member updated successfully');
      } else {
        await axios.post(`${API_BASE}/api/team`, payload, config);
        toast.success('Member added successfully');
      }

      navigate('/admin/team');
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        `Failed to ${isEditMode ? 'update' : 'add'} member`;
      toast.error(errMsg);
      if (error.response?.status === 401 || (typeof errMsg === 'string' && errMsg.toLowerCase().includes('token'))) {
        toast.info('Session expired or invalid. Please log in again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/team"
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Member' : 'Add New Member'}</h1>
            <p className="text-zinc-500 text-sm">Fill in the details below &amp; customize your card</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">

            {/* Color Customization Section */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl flex flex-col items-center">
              <HexagonColorPicker
                label="Custom Card Accent Color"
                value={formData.cardColor || '#facc15'}
                onChange={(color) => setFormData((prev) => ({ ...prev, cardColor: color }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Sub-team</label>
                <select
                  name="subteam"
                  value={formData.subteam}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                >
                  <option value="">— Select Sub-team —</option>
                  {ADD_SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-zinc-600 text-xs mt-1">Sub-team determines which roles are available below.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  required
                >
                  <option value="">Select a role</option>
                  {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {formData.subteam && ROLES_BY_SUBTEAM[formData.subteam] && (
                  <p className="text-zinc-600 text-xs mt-1">
                    Showing roles valid for <span className="text-yellow-400">{formData.subteam}</span>.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Department</label>
                <input
                  type="text"
                  name="Department"
                  value={formData.Department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="E.g., Computer Science"
                />
              </div>

              {/* ── Year — now a dropdown with standard SCIEnT team years ── */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  SCIEnT Team Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                >
                  <option value="">— Select Year —</option>
                  {SCIENT_YEARS.map(y => (
                    <option key={y} value={y}>Team of {y}</option>
                  ))}
                  {/* If existing member has a non-standard year value, show it so it isn't lost */}
                  {formData.year && !SCIENT_YEARS.includes(formData.year) && (
                    <option value={formData.year}>{formData.year} (legacy)</option>
                  )}
                </select>
                <p className="text-zinc-600 text-xs mt-1">Which year's team does this member belong to?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* ── Photo Upload Section ── */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">Member Photo</label>

              {/* Preview area */}
              {imagePreview ? (
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-yellow-400/40 bg-zinc-950">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:text-red-400 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-40 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-600">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">No photo</span>
                </div>
              )}

              {/* File picker + upload button */}
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-file-input"
                />
                <label
                  htmlFor="photo-file-input"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  {imageFile ? imageFile.name : 'Choose Image'}
                </label>

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                  >
                    {uploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading...</span></>
                      : <><Upload className="w-4 h-4" /><span>Upload to Cloud</span></>
                    }
                  </button>
                )}
              </div>

              {/* Current Cloudinary URL (read-only indicator) */}
              {formData.photoUrl && (
                <div className="flex items-start gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <span className="text-xs text-zinc-500 font-medium shrink-0 mt-0.5">Cloud URL:</span>
                  <span className="text-xs text-green-400 break-all">{formData.photoUrl}</span>
                </div>
              )}

              {/* Fallback: manual URL entry */}
              <details className="group">
                <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 select-none">
                  Or enter a URL manually
                </summary>
                <input
                  type="text"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white text-sm"
                  placeholder="https://..."
                />
              </details>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Instagram URL</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Description / Bio</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-yellow-400 text-white resize-none"
                placeholder="Brief intro..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
              <Link
                to="/admin/team"
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                ) : (
                  <><Save className="w-4 h-4" /><span>{isEditMode ? 'Update Member' : 'Create Member'}</span></>
                )}
              </button>
            </div>
          </form>

          {/* Right: Live Preview Panel */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-8 w-full flex flex-col items-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
              <div className="text-center">
                <span className="text-xs font-bold text-yellow-400 tracking-wider uppercase">Live Card Preview</span>
                <p className="text-xs text-zinc-500">Hover or click to flip the card</p>
              </div>

              <div className="w-full flex justify-center py-4">
                <MemberCard
                  member={{
                    name: formData.name || 'Member Name',
                    role: formData.role || 'Role Title',
                    subteam: formData.subteam || 'Subteam',
                    Department: formData.Department || 'Department',
                    year: formData.year || '',
                    photoUrl: imagePreview || formData.photoUrl,
                    email: formData.email || 'email@example.com',
                    linkedin: formData.linkedin || 'https://linkedin.com',
                    instagram: formData.instagram || 'https://instagram.com',
                    description: formData.description || 'Custom member bio will be displayed here on card flip.',
                    cardColor: formData.cardColor || '#facc15'
                  }}
                  index={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberForm;
