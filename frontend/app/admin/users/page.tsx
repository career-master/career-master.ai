'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, User } from '@/lib/api';

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>(['student']);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('institution_admin')) {
      router.push('/dashboard');
      return;
    }
    loadData(1, '');
  }, [isAuthenticated, user, router]);

  const loadData = async (pageNumber: number, searchTerm: string) => {
    try {
      setLoading(true);
      const [usersRes, batchesRes] = await Promise.all([
        apiService.getUsers({ page: pageNumber, limit: 10, search: searchTerm }),
        apiService.getBatches(1, 100),
      ]);

      if (usersRes.success && usersRes.data) {
        const data: any = usersRes.data;
        setUsers(Array.isArray(data.items) ? data.items : []);
        setPage(data.page || pageNumber);
        setTotalPages(data.totalPages || 1);
      }

      if (batchesRes.success && batchesRes.data) {
        const bdata: any = batchesRes.data;
        setBatches(Array.isArray(bdata.items) ? bdata.items : []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load users or batches');
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        name,
        email,
        phone: phone || undefined,
        password,
        roles,
        batches: selectedBatches,
      };

      const res = await apiService.createUser(payload);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to create user');
      }

      setSuccess('User created successfully');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRoles(['student']);
      setSelectedBatches([]);
      await loadData(1, '');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadData(1, search);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 text-sm">
              Create users, assign roles and batches. This is mainly for admin-created student accounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New User</h2>

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

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {['student', 'subscriber', 'institution_admin', 'content_admin', 'technical_admin', 'super_admin'].map(
                    (role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                          roles.includes(role)
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {role}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batches</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {batches.map((batch) => (
                    <button
                      key={batch._id}
                      type="button"
                      onClick={() => toggleBatch(batch.code)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                        selectedBatches.includes(batch.code)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {batch.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Users list */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Existing Users</h2>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                >
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              <>
                <div className="overflow-x-auto max-h-[520px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Email</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Roles</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Batches</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900 font-medium">{u.name}</td>
                          <td className="px-3 py-2 text-gray-600">{u.email}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {u.roles?.map((r) => (
                                <span
                                  key={r}
                                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray((u as any).batches) &&
                                (u as any).batches.map((b: string) => (
                                  <span
                                    key={b}
                                    className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                                  >
                                    {b}
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                u.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => loadData(page - 1, search)}
                      className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => loadData(page + 1, search)}
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


