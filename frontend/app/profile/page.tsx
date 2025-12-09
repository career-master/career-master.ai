'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading, refreshUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    school: '',
    jobTitle: '',
    currentStatus: '',
    interests: '',
    learningGoals: '',
    city: '',
    country: '',
    profilePicture: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.profile?.college || '',
        school: user.profile?.school || '',
        jobTitle: user.profile?.jobTitle || '',
        currentStatus: user.profile?.currentStatus || '',
        interests: (user.profile?.interests || []).join(', '),
        learningGoals: user.profile?.learningGoals || '',
        city: user.profile?.city || '',
        country: user.profile?.country || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const res = await apiService.getUserDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    const fields = [
      form.name.trim(),
      form.phone.trim(),
      form.currentStatus.trim(),
      form.college.trim(),
      form.school.trim(),
      form.jobTitle.trim(),
      form.interests.trim(),
      form.learningGoals.trim(),
      form.city.trim(),
      form.country.trim(),
      form.profilePicture.trim(),
    ];
    const filledFields = fields.filter(field => field.length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [form]);

  const isSavingDisabled = useMemo(() => {
    return saving || !form.name.trim();
  }, [saving, form.name]);

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      setUploadingPicture(true);
      setError('');
      const res = await apiService.uploadImage(file, 'career-master/profile-pictures');
      if (res.success && res.data?.url) {
        setForm((prev) => ({ ...prev, profilePicture: res.data.url }));
        // Auto-save profile picture
        const payload: any = {
          profilePicture: res.data.url,
        };
        await apiService.updateCurrentUser(payload);
        await refreshUser();
        setSuccess('Profile picture updated successfully');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setSaving(true);
      const payload: any = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        profilePicture: form.profilePicture.trim() || undefined,
        profile: {
          college: form.college.trim() || undefined,
          school: form.school.trim() || undefined,
          jobTitle: form.jobTitle.trim() || undefined,
          currentStatus: form.currentStatus.trim() || undefined,
          interests: form.interests
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
          learningGoals: form.learningGoals.trim() || undefined,
          city: form.city.trim() || undefined,
          country: form.country.trim() || undefined,
        },
      };

      const res = await apiService.updateCurrentUser(payload);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully');
      await refreshUser();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar to mirror dashboard with quick actions and profile dropdown */}
      <header className="bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white py-4 shadow">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="flex items-center gap-3 relative">
            {/* Quick actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/reports"
                className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
              >
                Reports
              </Link>
              <Link
                href="/dashboard/subjects"
                className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
              >
                Subjects
              </Link>
            </div>
            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm relative z-20"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    <div className="text-[11px] text-gray-400 truncate">{user?.roles?.join(', ') || 'Student'}</div>
                  </div>
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button onClick={() => router.push('/dashboard')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </button>
                  <button onClick={() => router.push('/dashboard/reports')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Reports
                  </button>
                  <button onClick={() => router.push('/dashboard/subjects')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Subjects
                  </button>
                  <hr className="my-2" />
                  <button onClick={() => router.push('/login')} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile View/Edit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Update your details. Email cannot be changed.' : 'View your profile information.'}
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div className="relative">
              {form.profilePicture ? (
                <div className="relative">
                  <img
                    src={form.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, profilePicture: '' }))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove picture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-3xl border-4 border-purple-200">
                  {form.name?.[0]?.toUpperCase() || form.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Profile Picture</label>
              <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                {uploadingPicture ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {form.profilePicture ? 'Change Picture' : 'Upload Picture'}
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  disabled={uploadingPicture}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (MAX. 10MB)</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email (read-only)</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
                value={form.email}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Current Status</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.currentStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, currentStatus: e.target.value }))}
                placeholder="Student, Working professional, etc."
              />
            </div>
          </div>

          {/* Education / Work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">College</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.college}
                onChange={(e) => setForm((prev) => ({ ...prev, college: e.target.value }))}
                placeholder="College/University"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">School</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.school}
                onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
                placeholder="School (if applicable)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Job Title</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.jobTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Software Engineer, Teacher, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Interests (comma separated)</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.interests}
                onChange={(e) => setForm((prev) => ({ ...prev, interests: e.target.value }))}
                placeholder="AI, Web Dev, Math"
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="text-sm font-medium text-gray-700">Learning Goals</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
              rows={3}
              value={form.learningGoals}
              onChange={(e) => setForm((prev) => ({ ...prev, learningGoals: e.target.value }))}
              placeholder="Tell us what you want to learn or improve."
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Country</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-gray-900"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
              />
            </div>
          </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSavingDisabled}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                    // Reset form to user data
                    if (user) {
                      setForm({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        college: user.profile?.college || '',
                        school: user.profile?.school || '',
                        jobTitle: user.profile?.jobTitle || '',
                        currentStatus: user.profile?.currentStatus || '',
                        interests: (user.profile?.interests || []).join(', '),
                        learningGoals: user.profile?.learningGoals || '',
                        city: user.profile?.city || '',
                        country: user.profile?.country || '',
                        profilePicture: user.profilePicture || '',
                      });
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                {success && <span className="text-green-600 text-sm">{success}</span>}
                {error && <span className="text-red-600 text-sm">{error}</span>}
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="relative">
                  {form.profilePicture ? (
                    <img
                      src={form.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-3xl border-4 border-purple-200">
                      {form.name?.[0]?.toUpperCase() || form.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{form.name || 'Your name'}</h3>
                  <p className="text-sm text-gray-600">{form.email}</p>
                  <p className="text-xs text-gray-500">{form.currentStatus || 'Status not set'}</p>
                </div>
              </div>

              {/* Profile Details in View Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{form.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{form.email || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{form.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Status</label>
                  <p className="mt-1 text-sm text-gray-900">{form.currentStatus || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">College</label>
                  <p className="mt-1 text-sm text-gray-900">{form.college || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">School</label>
                  <p className="mt-1 text-sm text-gray-900">{form.school || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Title</label>
                  <p className="mt-1 text-sm text-gray-900">{form.jobTitle || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interests</label>
                  <p className="mt-1 text-sm text-gray-900">{form.interests || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Learning Goals</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{form.learningGoals || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                  <p className="mt-1 text-sm text-gray-900">{form.city || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country</label>
                  <p className="mt-1 text-sm text-gray-900">{form.country || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live summary with progress */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            {/* Profile Completion Progress */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Profile Completion</h3>
                <span className="text-lg font-bold text-purple-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    profileCompletion === 100
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : profileCompletion >= 70
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : profileCompletion >= 40
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-400 to-pink-500'
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {profileCompletion === 100
                  ? '🎉 Your profile is complete!'
                  : profileCompletion >= 70
                  ? 'Great progress! Fill a few more fields to complete your profile.'
                  : profileCompletion >= 40
                  ? 'You\'re halfway there! Keep going!'
                  : 'Start filling your profile to unlock more features.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {form.profilePicture ? (
                <img
                  src={form.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xl">
                  {form.name?.[0]?.toUpperCase() || form.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{form.name || 'Your name'}</h3>
                <p className="text-sm text-gray-600">{form.email}</p>
                <p className="text-xs text-gray-500">{form.currentStatus || 'Status not set'}</p>
              </div>
            </div>
          </div>

          {/* AI LEARNING PROFILE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">AI Learning Profile</h6>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Score</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? `${stats.overview?.averagePercentage?.toFixed(1) || 0}%` : '0%'}
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: statsLoading ? '0%' : stats ? `${Math.min(stats.overview?.averagePercentage || 0, 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Accuracy</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? `${stats.overview?.accuracy?.toFixed(1) || 0}%` : '0%'}
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: statsLoading ? '0%' : stats ? `${Math.min(stats.overview?.accuracy || 0, 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? `${stats.overview?.passRate?.toFixed(1) || 0}%` : '0%'}
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: statsLoading ? '0%' : stats ? `${Math.min(stats.overview?.passRate || 0, 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* QUIZ STATISTICS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Quiz Statistics</h6>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Attempts</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? stats.overview?.totalAttempts || 0 : 0}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Quizzes Attempted</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? stats.overview?.totalQuizzesAttempted || 0 : 0}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Available Quizzes</span>
                <span className="text-sm font-bold text-gray-900">
                  {statsLoading ? '...' : stats ? stats.overview?.availableQuizzes || 0 : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

