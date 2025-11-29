'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function AdminBatchesNewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enableStartDate, setEnableStartDate] = useState(false);
  const [enableEndDate, setEnableEndDate] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Student management
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentBatchCode, setCurrentBatchCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }

    // Load batch data if editing
    if (batchId) {
      loadBatch(batchId);
    }
  }, [isAuthenticated, user, router, batchId]);

  const loadBatch = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiService.getBatchById(id);
      if (res.success && res.data) {
        const batch = res.data;
        setName(batch.name || '');
        setCode(batch.code || '');
        setDescription(batch.description || '');
        const hasStartDate = batch.startDate ? true : false;
        const hasEndDate = batch.endDate ? true : false;
        setEnableStartDate(hasStartDate);
        setEnableEndDate(hasEndDate);
        setStartDate(hasStartDate ? new Date(batch.startDate).toISOString().split('T')[0] : '');
        setEndDate(hasEndDate ? new Date(batch.endDate).toISOString().split('T')[0] : '');
        setIsActive(batch.isActive !== undefined ? batch.isActive : true);
        setCurrentBatchCode(batch.code || '');
        
        // Load students in this batch
        if (batch.code) {
          loadBatchStudents(batch.code);
        }
      } else {
        throw new Error('Failed to load batch');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load batch');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!name.trim()) {
      setError('Batch name is required');
      return;
    }
    if (!code.trim()) {
      setError('Batch code is required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        code: code.trim().toUpperCase().replace(/\s+/g, '-'),
        description: description.trim() || undefined,
        isActive,
      };
      // Only include dates if checkboxes are enabled
      if (enableStartDate && startDate) {
        payload.startDate = startDate;
      } else if (batchId && !enableStartDate) {
        // If editing and checkbox is unchecked, send empty to clear the date
        payload.startDate = '';
      }
      if (enableEndDate && endDate) {
        payload.endDate = endDate;
      } else if (batchId && !enableEndDate) {
        // If editing and checkbox is unchecked, send empty to clear the date
        payload.endDate = '';
      }

      let res;
      if (batchId) {
        res = await apiService.updateBatch(batchId, payload);
      } else {
        res = await apiService.createBatch(payload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || res.message || `Failed to ${batchId ? 'update' : 'create'} batch`);
      }

      // Update current batch code if it's a new batch
      if (!batchId && res.data?.code) {
        setCurrentBatchCode(res.data.code);
        // Update URL to edit mode
        const newUrl = `/admin/batches/new?id=${res.data._id}`;
        window.history.replaceState({}, '', newUrl);
      }

      setSuccess(`Batch ${batchId ? 'updated' : 'created'} successfully`);
      
      // Load students if batch code is available
      if (res.data?.code) {
        setCurrentBatchCode(res.data.code);
        await loadBatchStudents(res.data.code);
      }
      
      // Don't redirect immediately - let user manage students
      // setTimeout(() => {
      //   router.push('/admin/batches');
      // }, 1500);
    } catch (err: any) {
      setError(err.message || `Failed to ${batchId ? 'update' : 'create'} batch`);
    } finally {
      setSaving(false);
    }
  };

  const loadBatchStudents = async (batchCode: string) => {
    try {
      setLoadingUsers(true);
      const res = await apiService.getBatchStudents(batchCode, 1, 100);
      if (res.success && res.data) {
        setBatchStudents(Array.isArray(res.data.items) ? res.data.items : []);
      }
    } catch (err: any) {
      console.error('Failed to load batch students:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAvailableUsers = async (searchTerm: string = '') => {
    try {
      setLoadingUsers(true);
      const res = await apiService.getUsers({ page: 1, limit: 50, search: searchTerm });
      if (res.success && res.data) {
        const allUsers = Array.isArray(res.data.items) ? res.data.items : [];
        // Filter out users already in the batch
        const batchUserIds = batchStudents.map((s: any) => s._id);
        setAvailableUsers(allUsers.filter((u: any) => !batchUserIds.includes(u._id)));
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentBatchCode) {
      loadBatchStudents(currentBatchCode);
    }
  }, [currentBatchCode]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (currentBatchCode) {
        loadAvailableUsers(userSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, batchStudents, currentBatchCode]);

  const handleAddStudent = async (userId: string) => {
    if (!currentBatchCode) {
      setError('Please save the batch first before adding students');
      return;
    }

    try {
      const res = await apiService.addStudentsToBatch(currentBatchCode, [userId]);
      if (res.success) {
        await loadBatchStudents(currentBatchCode);
        await loadAvailableUsers(userSearch);
        setSuccess('Student added to batch successfully');
      } else {
        throw new Error(res.error?.message || 'Failed to add student');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!currentBatchCode) {
      return;
    }

    if (!confirm('Are you sure you want to remove this student from the batch?')) {
      return;
    }

    try {
      const res = await apiService.removeStudentsFromBatch(currentBatchCode, [userId]);
      if (res.success) {
        await loadBatchStudents(currentBatchCode);
        await loadAvailableUsers(userSearch);
        setSuccess('Student removed from batch successfully');
      } else {
        throw new Error(res.error?.message || 'Failed to remove student');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove student');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading batch...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {batchId ? 'Edit Batch' : 'Add New Batch'}
            </h1>
            <p className="text-gray-600 text-sm">
              {batchId ? 'Update batch information' : 'Create a new batch for students'}
            </p>
          </div>
          <Link
            href="/admin/batches"
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
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Batch A, 2025-CS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="Unique code (e.g. BATCH-2025-CS)"
                />
                <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase with hyphens</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                placeholder="Short description of the batch..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableStartDate}
                    onChange={(e) => {
                      setEnableStartDate(e.target.checked);
                      if (!e.target.checked) {
                        setStartDate('');
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Set Start Date</label>
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!enableStartDate}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableEndDate}
                    onChange={(e) => {
                      setEnableEndDate(e.target.checked);
                      if (!e.target.checked) {
                        setEndDate('');
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Set End Date</label>
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!enableEndDate}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : batchId ? 'Update Batch' : 'Create Batch'}
              </button>
              <Link
                href="/admin/batches"
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Student Management Section */}
        {currentBatchCode && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Manage Students</h2>
            
            {/* Current Students */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Students in Batch ({batchStudents.length})
              </h3>
              {loadingUsers ? (
                <p className="text-sm text-gray-500">Loading students...</p>
              ) : batchStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No students in this batch yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {batchStudents.map((student: any) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Students */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Students</h3>
              <div className="mb-3">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              {loadingUsers ? (
                <p className="text-sm text-gray-500">Loading users...</p>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {userSearch ? 'No users found matching your search.' : 'Search for users to add them to the batch.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableUsers.map((user: any) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddStudent(user._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Link
            href="/admin/batches"
            className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Back to Batches List
          </Link>
        </div>
      </div>
    </div>
  );
}

