'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

type AnnouncementType = 'update' | 'training' | 'exam';

export default function AdminAnnouncementsNewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const announcementId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AnnouncementType>('update');
  const [dateText, setDateText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number | ''>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('content_admin') && !user?.roles?.includes('technical_admin')) {
      router.push('/dashboard');
      return;
    }
    if (announcementId) {
      loadAnnouncement(announcementId);
    }
  }, [isAuthenticated, user, router, announcementId]);

  const loadAnnouncement = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiService.getAnnouncementById(id);
      if (res.success && res.data) {
        const item: any = res.data;
        setTitle(item.title || '');
        setDescription(item.description || '');
        setType(item.type || 'update');
        setDateText(item.dateText || '');
        setStartDate(item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '');
        setEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '');
        setStatus(item.status || '');
        setLinkUrl(item.linkUrl || '');
        setLinkLabel(item.linkLabel || '');
        setIsActive(item.isActive !== undefined ? item.isActive : true);
        setOrder(typeof item.order === 'number' ? item.order : '');
      } else {
        throw new Error('Failed to load announcement');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        type,
        dateText: dateText.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        linkLabel: linkLabel.trim() || undefined,
        isActive,
        order: order === '' ? undefined : Number(order)
      };

      let res;
      if (announcementId) {
        res = await apiService.updateAnnouncement(announcementId, payload);
      } else {
        res = await apiService.createAnnouncement(payload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || res.message || `Failed to ${announcementId ? 'update' : 'create'} announcement`);
      }

      setSuccess(`Announcement ${announcementId ? 'updated' : 'created'} successfully`);

      setTimeout(() => {
        router.push('/admin/announcements');
      }, 1200);
    } catch (err: any) {
      setError(err.message || `Failed to ${announcementId ? 'update' : 'create'} announcement`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading announcement...</div>
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
              {announcementId ? 'Edit Announcement' : 'Add Announcement'}
            </h1>
            <p className="text-gray-600 text-sm">
              These announcements appear in the homepage Updates, Events & Exams section.
            </p>
          </div>
          <Link
            href="/admin/announcements"
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
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AnnouncementType)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                >
                  <option value="update">Quick Update</option>
                  <option value="training">Online Training</option>
                  <option value="exam">Latest Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) =>
                    setOrder(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Smaller numbers appear first within each type.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                placeholder={
                  type === 'update'
                    ? 'e.g. New Quiz Added'
                    : type === 'training'
                    ? 'e.g. Interview Skills Workshop'
                    : 'e.g. GATE 2026'
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                placeholder={
                  type === 'update'
                    ? 'Short description of the update...'
                    : type === 'training'
                    ? 'Brief details about the training...'
                    : 'Key info about the exam (date, phase, etc.)...'
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Text
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder={
                    type === 'training'
                      ? 'e.g. Feb 15, 2026 - 2:00 PM'
                      : type === 'update'
                      ? 'e.g. Jan 28, 2026'
                      : 'e.g. Exam: Feb 1-16, 2026'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shown directly in the card. Use any readable format.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status (optional)
                </label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder={
                    type === 'exam'
                      ? 'e.g. Applications Open / Admit Card Released'
                      : 'Short status label'
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date (for sorting, optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link Label (optional)
                </label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Register Now"
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
              <p className="text-xs text-gray-500 mt-1">
                Only active announcements are shown on the homepage.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : announcementId ? 'Update Announcement' : 'Create Announcement'}
              </button>
              <Link
                href="/admin/announcements"
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

