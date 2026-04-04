'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AdminExportButtons from '@/components/AdminExportButtons';
import { exportRowsToDoc, exportRowsToPdf } from '@/lib/adminExport';

export default function AdminBatchesListPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadBatches = useCallback(async (pageNumber: number, searchTerm: string = '') => {
    try {
      setLoading(true);
      const res = await apiService.getBatches(pageNumber, 10);
      if (res.success && res.data) {
        const data: any = res.data;
        let items = Array.isArray(data.items) ? data.items : [];
        
        // Client-side search filter
        if (searchTerm) {
          items = items.filter((batch: any) =>
            batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            batch.code.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setBatches(items);
        setPage(data.page || pageNumber);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }
    loadBatches(1, search);
  }, [isAuthenticated, user, router, loadBatches]);

  useEffect(() => {
    loadBatches(page, search);
  }, [page, search, loadBatches]);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await apiService.deleteBatch(id);
      if (res.success) {
        toast.success('Batch deleted');
        await loadBatches(page, search);
      } else {
        throw new Error(res.error?.message || 'Failed to delete batch');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete batch');
    }
  };

  const exportBatchesDocuments = useCallback(
    async (format: 'pdf' | 'doc') => {
      const limit = 150;
      let p = 1;
      let tp = 1;
      const all: any[] = [];
      do {
        const res = await apiService.getBatches(p, limit);
        if (!res.success || !res.data) break;
        const data: any = res.data;
        const items = Array.isArray(data.items) ? data.items : [];
        all.push(...items);
        tp = data.totalPages || 1;
        p += 1;
      } while (p <= tp && p < 200);

      let list = all;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = all.filter(
          (b: any) =>
            String(b.name || '')
              .toLowerCase()
              .includes(q) || String(b.code || '')
              .toLowerCase()
              .includes(q)
        );
      }

      if (list.length === 0) {
        throw new Error('No batches to export (adjust search if needed)');
      }

      const headers = ['S.No', 'Batch name', 'Code', 'Description', 'Status', 'Created'];
      const rows = list.map((batch: any, index: number) => [
        String(index + 1),
        batch.name || '—',
        batch.code || '—',
        (batch.description || '—').replace(/\s+/g, ' ').slice(0, 500),
        batch.isActive ? 'Active' : 'Inactive',
        batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '—',
      ]);
      const sub = `Rows: ${list.length}${search.trim() ? ` · Search: "${search.trim()}"` : ''}`;
      if (format === 'pdf') {
        exportRowsToPdf('Batch management', sub, headers, rows, 'admin-batches');
      } else {
        exportRowsToDoc('Batch management', sub, headers, rows, 'admin-batches');
      }
    },
    [search]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
            <p className="text-gray-600 text-sm">View and manage all batches</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminExportButtons
              disabled={loading}
              onPdf={() => exportBatchesDocuments('pdf')}
              onDoc={() => exportBatchesDocuments('doc')}
            />
            <Link
              href="/admin/batches/new"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              + Add New Batch
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch name or code..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No batches found. <Link href="/admin/batches/new" className="text-red-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Batch Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Batch Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batches.map((batch, index) => (
                      <tr key={batch._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * 10 + index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{batch.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{batch.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {batch.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              batch.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {batch.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                              href={`/admin/batches/new?id=${batch._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/admin/reports?batchScope=batch_only&batchCode=${encodeURIComponent(batch.code)}`}
                              className="text-amber-700 hover:text-amber-900 text-sm font-medium"
                              title="Quiz reports for students in this batch"
                            >
                              Reports
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(batch._id, batch.name)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:text-gray-500"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:text-gray-500"
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
  );
}
