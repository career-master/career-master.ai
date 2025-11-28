'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function AdminBatchesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }
    loadBatches(1);
  }, [isAuthenticated, user, router]);

  const loadBatches = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await apiService.getBatches(pageNumber, 10);
      if (res.success && res.data) {
        const data: any = res.data;
        setBatches(Array.isArray(data.items) ? data.items : []);
        setPage(data.page || pageNumber);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload: any = {
        name,
        code,
        description,
      };
      if (startDate) payload.startDate = startDate;
      if (endDate) payload.endDate = endDate;

      const res = await apiService.createBatch(payload);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to create batch');
      }
      setSuccess('Batch created successfully');
      setName('');
      setCode('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      await loadBatches(1);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
            <p className="text-gray-600 text-sm">
              Create and manage student batches. These batches can be used to control quiz availability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Batch */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Batch</h2>

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

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Batch A, 2025-CS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="Unique code (e.g. BATCH-2025-CS)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="Short description of the batch..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Create Batch'}
              </button>
            </form>
          </div>

          {/* Batch list */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Existing Batches</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Loading batches...</p>
            ) : batches.length === 0 ? (
              <p className="text-sm text-gray-500">No batches created yet.</p>
            ) : (
              <>
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 mb-4">
                  {batches.map((batch) => (
                    <div
                      key={batch._id}
                      className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{batch.name}</h3>
                          <p className="text-xs text-gray-500">{batch.code}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            batch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {batch.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      {batch.description && (
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">{batch.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'No start'} →{' '}
                          {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'No end'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => loadBatches(page - 1)}
                      className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => loadBatches(page + 1)}
                      className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


