'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setIsAdminRoute(true);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Under Development</h1>
          <p className="text-lg text-gray-600 mb-1">
            We're working on this page
          </p>
          <p className="text-sm text-gray-500">
            Please check back soon!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Our team is actively developing this feature. Thank you for your patience!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              try {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  router.push(isAdminRoute ? '/admin/dashboard' : '/dashboard');
                }
              } catch (err) {
                router.push(isAdminRoute ? '/admin/dashboard' : '/dashboard');
              }
            }}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                router.push(isAdminRoute ? '/admin/dashboard' : '/');
              } catch (err) {
                window.location.href = isAdminRoute ? '/admin/dashboard' : '/';
              }
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isAdminRoute ? 'Go to Admin Dashboard' : 'Go to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

