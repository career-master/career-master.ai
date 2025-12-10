'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type SubjectRequest = {
  _id: string;
  userId: { _id: string; name?: string; email?: string };
  subjectId: { _id: string; title: string };
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function AdminSubjectRequestsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SubjectRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = user?.roles?.some((r: string) =>
    ['super_admin', 'content_admin', 'technical_admin', 'institution_admin'].includes(r)
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSubjectRequests({ status: 'pending', page: 1, limit: 50 });
      if (res.success) {
        const data: any = res.data;
        const items = data?.items || data?.data?.items || [];
        setRequests(items as SubjectRequest[]);
      } else {
        toast.error(res.message || 'Failed to load requests');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(id);
      const res =
        action === 'approve'
          ? await apiService.approveSubjectRequest(id)
          : await apiService.rejectSubjectRequest(id);
      if (res.success) {
        toast.success(`Request ${action}d`);
        await loadRequests();
      } else {
        toast.error(res.message || `Failed to ${action} request`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subject Access Requests</h1>
            <p className="text-gray-600 mt-1">Approve or reject student requests to join subjects.</p>
          </div>
          <button
            onClick={loadRequests}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending requests</h3>
            <p className="text-gray-600">All caught up!</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <div className="col-span-4">Student</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Requested</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-200">
              {requests.map((req) => (
                <div key={req._id} className="grid grid-cols-12 px-4 py-4 items-center">
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-900">{req.userId?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{req.email || req.userId?.email}</p>
                    {req.phone && <p className="text-xs text-gray-500 mt-1">📞 {req.phone}</p>}
                  </div>
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-900">{req.subjectId?.title || 'Subject'}</p>
                    <p className="text-xs text-gray-500">ID: {req.subjectId?._id}</p>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {new Date(req.createdAt).toLocaleString()}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleAction(req._id, 'approve')}
                      disabled={processingId === req._id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {processingId === req._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'reject')}
                      disabled={processingId === req._id}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

