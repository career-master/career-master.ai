'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function AdminUsersNewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [batches, setBatches] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>(['student']);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'banned'>('active');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }

    // Load batches
    loadBatches();

    // Load user data if editing
    if (userId) {
      loadUser(userId);
    }
  }, [isAuthenticated, user, router, userId]);

  const loadBatches = async () => {
    try {
      const res = await apiService.getBatches(1, 100);
      if (res.success && res.data) {
        const data: any = res.data;
        setBatches(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err: any) {
      console.error('Failed to load batches:', err);
    }
  };

  const loadUser = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiService.getUserById(id);
      if (res.success && res.data) {
        const userData = res.data;
        setName(userData.name || '');
        setEmail(userData.email || '');
        setPhone((userData as any).phone || '');
        setRoles(userData.roles || ['student']);
        setSelectedBatches(Array.isArray((userData as any).batches) ? (userData as any).batches : []);
        setStatus((userData as any).status || 'active');
      } else {
        throw new Error('Failed to load user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleBatch = (code: string) => {
    setSelectedBatches((prev) =>
      prev.includes(code) ? prev.filter((b) => b !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!userId && !password.trim()) {
      setError('Password is required for new users');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        roles,
        batches: selectedBatches,
        status,
      };

      if (!userId && password.trim()) {
        payload.password = password;
      }

      let res;
      if (userId) {
        res = await apiService.updateUser(userId, payload);
      } else {
        res = await apiService.createUser(payload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || res.message || `Failed to ${userId ? 'update' : 'create'} user`);
      }

      setSuccess(`User ${userId ? 'updated' : 'created'} successfully`);
      setTimeout(() => {
        router.push('/admin/users');
      }, 1500);
    } catch (err: any) {
      setError(err.message || `Failed to ${userId ? 'update' : 'create'} user`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading user...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userId ? 'Edit User' : 'Add New User'}
            </h1>
            <p className="text-gray-600 text-sm">
              {userId ? 'Update user information' : 'Create a new user account'}
            </p>
          </div>
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back to List
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!userId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                />
                {userId && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {userId ? 'New Password (leave blank to keep current)' : 'Password'} {!userId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!userId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Roles</label>
              <div className="flex flex-wrap gap-2">
                {['student', 'subscriber', 'institution_admin', 'content_admin', 'technical_admin', 'super_admin'].map(
                  (role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                        roles.includes(role)
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {role}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batches</label>
              {batches.length === 0 ? (
                <p className="text-sm text-gray-500">No batches available. Create batches first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {batches.map((batch) => (
                    <button
                      key={batch._id}
                      type="button"
                      onClick={() => toggleBatch(batch.code)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                        selectedBatches.includes(batch.code)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {batch.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="active"
                    checked={status === 'active'}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'banned')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="banned"
                    checked={status === 'banned'}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'banned')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Banned</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : userId ? 'Update User' : 'Create User'}
              </button>
              <Link
                href="/admin/users"
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

