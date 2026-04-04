'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, User } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getProfileCompletionPercent } from '@/lib/profileConfig';
import { useProfileSettings } from '@/contexts/ProfileSettingsContext';
import AdminExportButtons from '@/components/AdminExportButtons';
import { exportRowsToDoc, exportRowsToPdf } from '@/lib/adminExport';

const PAGE_SIZE = 25;

export default function AdminUsersListPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { profileMinCompletionPercent } = useProfileSettings();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [batchCatalog, setBatchCatalog] = useState<{ _id: string; code: string; name: string }[]>([]);

  const loadUsers = useCallback(
    async (pageNumber: number) => {
      try {
        setLoading(true);
        const res = await apiService.getUsers({
          page: pageNumber,
          limit: PAGE_SIZE,
          search: searchApplied || undefined,
          role: filterRole || undefined,
          batch: filterBatch || undefined,
        });
        if (res.success && res.data) {
          const data: any = res.data;
          setUsers(Array.isArray(data.items) ? data.items : []);
          setPage(data.page || pageNumber);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total ?? data.items?.length ?? 0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [searchApplied, filterRole, filterBatch]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }
    loadUsers(1);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) return;
    (async () => {
      try {
        const res = await apiService.getBatches(1, 500);
        if (res.success && res.data) {
          const data: any = res.data;
          setBatchCatalog(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadUsers(page);
  }, [page, loadUsers]);

  // Select-all checkbox state
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    const allSelected = users.length > 0 && selected.size === users.length;
    const someSelected = selected.size > 0;
    el.checked = allSelected;
    el.indeterminate = someSelected && !allSelected;
  }, [selected.size, users.length]);

  const handleSearch = () => {
    setSearchApplied(search);
    setPage(1);
    loadUsers(1);
  };

  // Typing in the search bar updates results after a short pause (no need to click Search).
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchApplied(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const handleReset = () => {
    setSearch('');
    setSearchApplied('');
    setFilterRole('');
    setFilterBatch('');
    setPage(1);
    loadUsers(1);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiService.deleteUser(id);
      if (res.success) {
        toast.success((res as any).message || 'User deleted successfully');
        setMenuOpenId(null);
        setPage(1);
        await loadUsers(1);
      } else {
        toast.error((res as any).error?.message || (res as any).message || 'Failed to delete user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleBlock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      const res = await apiService.updateUser(id, { status: newStatus as 'active' | 'banned' });
      if (res.success) {
        toast.success(newStatus === 'banned' ? 'User blocked' : 'User unblocked');
        setMenuOpenId(null);
        await loadUsers(page);
      } else {
        toast.error((res as any).message || 'Failed to update user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const toggleSelectAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const batchOptions = useMemo(
    () => [...batchCatalog].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [batchCatalog]
  );

  const batchDisplay = useCallback(
    (stored: string) => {
      const b = batchCatalog.find((x) => x.code === stored || String(x._id) === String(stored));
      return {
        code: b?.code ?? stored,
        title: b ? `${b.name} (${b.code})` : stored,
      };
    },
    [batchCatalog]
  );

  const exportCsv = () => {
    const headers = ['S.No', 'Name', 'Email', 'Phone', 'Profile %', 'Roles', 'Batches', 'Status'];
    const rows = users.map((u, i) => {
      const pct = getProfileCompletionPercent(u as any);
      const status = (u as any).status || 'active';
      return [
        (page - 1) * PAGE_SIZE + i + 1,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${((u as any).phone || '').replace(/"/g, '""')}"`,
        pct,
        (u.roles || []).join('; '),
        Array.isArray((u as any).batches)
          ? (u as any).batches.map((x: string) => batchDisplay(x).code).join('; ')
          : '',
        status,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Export started');
  };

  const exportUsersDocuments = useCallback(
    async (format: 'pdf' | 'doc') => {
      const limit = 150;
      let pageNum = 1;
      let totalP = 1;
      const all: User[] = [];
      do {
        const res = await apiService.getUsers({
          page: pageNum,
          limit,
          search: searchApplied || undefined,
          role: filterRole || undefined,
          batch: filterBatch || undefined,
        });
        if (!res.success || !res.data) break;
        const data: any = res.data;
        const items = Array.isArray(data.items) ? data.items : [];
        all.push(...items);
        totalP = data.totalPages || 1;
        pageNum += 1;
      } while (pageNum <= totalP && pageNum < 400);

      if (all.length === 0) {
        throw new Error('No users match the current filters');
      }

      const headers = ['S.No', 'Name', 'Email', 'Phone', 'Profile %', 'Roles', 'Batches', 'Status'];
      const rows = all.map((u, i) => [
        String(i + 1),
        u.name || '',
        u.email || '',
        String((u as any).phone || ''),
        String(getProfileCompletionPercent(u as any)),
        (u.roles || []).join(', '),
        Array.isArray((u as any).batches)
          ? (u as any).batches.map((x: string) => batchDisplay(x).code).join(', ')
          : '',
        String((u as any).status || 'active'),
      ]);
      const sub = `Total: ${all.length} · Role: ${filterRole || 'all'} · Batch: ${filterBatch || 'all'} · Search: ${searchApplied || '—'}`;
      if (format === 'pdf') {
        exportRowsToPdf('User management', sub, headers, rows, 'admin-users');
      } else {
        exportRowsToDoc('User management', sub, headers, rows, 'admin-users');
      }
    },
    [searchApplied, filterRole, filterBatch, batchDisplay]
  );

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section: Manage Users - Add/Update/Delete/Search/Filter layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h2>
          <p className="text-gray-600 text-sm mb-4">
            Profile % is used for quiz access (min {profileMinCompletionPercent}%).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="student">student</option>
                <option value="super_admin">super_admin</option>
                <option value="institution_admin">institution_admin</option>
                <option value="content_admin">content_admin</option>
                <option value="technical_admin">technical_admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Batch</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Batches</option>
                {batchOptions.map((b) => (
                  <option key={b._id} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/users/new"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              + Add
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Reset
            </button>
            <AdminExportButtons
              disabled={loading}
              onPdf={() => exportUsersDocuments('pdf')}
              onDoc={() => exportUsersDocuments('doc')}
            />
          </div>
        </div>

        {/* Search & Filter row - same as reference */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm"
            >
              <option value="">All Roles</option>
              <option value="student">student</option>
              <option value="super_admin">super_admin</option>
              <option value="institution_admin">institution_admin</option>
            </select>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm"
            >
              <option value="">All Batches</option>
              {batchOptions.map((b) => (
                <option key={b._id} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadUsers(1)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <AdminExportButtons
              disabled={loading}
              onPdf={() => exportUsersDocuments('pdf')}
              onDoc={() => exportUsersDocuments('doc')}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table - same structure as reference: checkbox, SNO, columns, Status with dot, Actions (edit, delete, menu) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found. <Link href="/admin/users/new" className="text-blue-600 hover:underline">Add one</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SNO</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Roles</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batches</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u, index) => {
                      const pct = getProfileCompletionPercent(u as any);
                      const meetsQuiz = pct >= profileMinCompletionPercent;
                      const status = (u as any).status || 'active';
                      const isActive = status === 'active';
                      return (
                        <tr key={u._id} className="hover:bg-gray-50 whitespace-nowrap">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selected.has(u._id)}
                              onChange={() => toggleSelect(u._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 max-w-[180px] truncate">
                            {u.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 max-w-[220px] truncate">
                            {u.email}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 max-w-[140px] truncate">
                            {(u as any).phone || '—'}
                          </td>
                          <td className="px-4 py-2">
                            <div className="inline-flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{pct}%</span>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  meetsQuiz ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {meetsQuiz ? 'Quiz OK' : 'Fill profile'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1 max-w-[180px] overflow-x-auto no-scrollbar">
                              {u.roles?.map((r) => (
                                <span
                                  key={r}
                                  className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {r}
                                </span>
                              ))}
                              {(!u.roles || u.roles.length === 0) && <span className="text-gray-400">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1 max-w-[160px] overflow-x-auto no-scrollbar">
                              {Array.isArray((u as any).batches) && (u as any).batches.length > 0 ? (
                                (u as any).batches.map((b: string) => {
                                  const { code, title } = batchDisplay(b);
                                  return (
                                    <span
                                      key={`${u._id}-${b}`}
                                      title={title}
                                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800"
                                    >
                                      {code}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                isActive ? 'text-green-700' : 'text-gray-500'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                              />
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1 relative">
                              <Link
                                href={`/admin/users/new?id=${u._id}`}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(u._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setMenuOpenId(menuOpenId === u._id ? null : u._id)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                  title="More"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                                {menuOpenId === u._id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      aria-hidden
                                      onClick={() => setMenuOpenId(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                                      <button
                                        type="button"
                                        onClick={() => handleBlock(u._id, status)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        {isActive ? 'Block user' : 'Unblock user'}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - "Showing 1 - 25 of 188" style */}
              <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-900">
                  Showing {start} - {end} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:text-gray-500"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-900 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-1 text-gray-900">…</span>
                      <button
                        type="button"
                        onClick={() => setPage(totalPages)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === totalPages ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-900 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:text-gray-500"
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
