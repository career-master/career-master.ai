'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileSettings } from '@/contexts/ProfileSettingsContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    profileCompletionEnforced,
    profileMinCompletionPercent,
    loading: settingsLoading,
    refetch,
  } = useProfileSettings();
  const [enforced, setEnforced] = useState(profileCompletionEnforced);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setEnforced(profileCompletionEnforced);
  }, [profileCompletionEnforced]);

  const handleToggle = async () => {
    const next = !enforced;
    setSaving(true);
    try {
      const res = await apiService.updateSettings({ profileCompletionEnforced: next });
      if (res.success && res.data) {
        setEnforced(res.data.profileCompletionEnforced);
        await refetch();
        toast.success(
          next
            ? `Users must complete ${profileMinCompletionPercent}% profile to attempt quizzes`
            : 'Profile completion requirement turned off. Users can attempt quizzes without filling profile.'
        );
      } else {
        toast.error(res.message || 'Failed to update settings');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user?.roles?.includes('super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-sm mb-6">App-wide settings (super admin only).</p>

        {settingsLoading ? (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="animate-pulse h-20 bg-gray-100 rounded" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quiz access</h2>
              <p className="text-sm text-gray-600 mt-1">
                When ON, users must complete at least {profileMinCompletionPercent}% of their profile before they can attempt quizzes or request subject access.
              </p>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Require 70% profile for quizzes</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {enforced ? 'Users must fill profile to attempt quizzes' : 'No profile requirement; anyone can attempt quizzes'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enforced}
                disabled={saving}
                onClick={handleToggle}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 ${
                  enforced ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enforced ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
