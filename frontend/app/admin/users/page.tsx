'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, User } from '@/lib/api';

export default function AdminUsersListPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async (pageNumber: number, searchTerm: string = '') => {
    try {
      setLoading(true);
      const res = await apiService.getUsers({ page: pageNumber, limit: 10, search: searchTerm });
      if (res.success && res.data) {
        const data: any = res.data;
        setUsers(Array.isArray(data.items) ? data.items : []);
        setPage(data.page || pageNumber);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load users');
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
    loadUsers(1, search);
  }, [isAuthenticated, user, router, loadUsers]);

  useEffect(() => {
    loadUsers(page, search);
  }, [page, search, loadUsers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await apiService.deleteUser(id);
      if (res.success) {
        await loadUsers(page, search);
      } else {
        throw new Error(res.error?.message || 'Failed to delete user');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleBlock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    const action = newStatus === 'banned' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const res = await apiService.updateUser(id, { status: newStatus as 'active' | 'banned' });
      if (res.success) {
        await loadUsers(page, search);
      } else {
        throw new Error(res.error?.message || `Failed to ${action} user`);
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 text-sm">View and manage all users</p>
          </div>
          <Link
            href="/admin/users/new"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            + Add New User
          </Link>
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
            placeholder="Search by name or email..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found. <Link href="/admin/users/new" className="text-red-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Roles</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Batches</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u, index) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * 10 + index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{(u as any).phone || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r) => (
                              <span
                                key={r}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray((u as any).batches) && (u as any).batches.length > 0 ? (
                              (u as any).batches.map((b: string) => (
                                <span
                                  key={b}
                                  className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
                                >
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              (u as any).status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {(u as any).status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/users/new?id=${u._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleBlock(u._id, (u as any).status || 'active')}
                              className={`text-sm font-medium ${
                                (u as any).status === 'active'
                                  ? 'text-orange-600 hover:text-orange-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {(u as any).status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
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
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
