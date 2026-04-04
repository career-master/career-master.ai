'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Set active item based on current path
    if (pathname?.includes('/reports')) {
      setActiveItem('reports');
    } else if (pathname?.includes('/leaderboard')) {
      setActiveItem('leaderboard');
    } else if (pathname?.includes('/quizzes')) {
      setActiveItem('quizzes');
    } else if (pathname?.includes('/coupons')) {
      setActiveItem('coupons');
    } else if (pathname?.includes('/subjects')) {
      setActiveItem('subjects');
    } else if (pathname?.includes('/profile')) {
      setActiveItem('profile');
    } else if (pathname?.includes('/certificates')) {
      setActiveItem('certificates');
    } else if (pathname?.includes('/dashboard')) {
      setActiveItem('dashboard');
    }
  }, [pathname]);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ), 
      href: '/dashboard' 
    },
    { 
      id: 'subjects', 
      label: 'Subjects & Topics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      href: '/dashboard/subjects' 
    },
    { 
      id: 'quizzes', 
      label: 'Quizzes', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      href: '/dashboard/quizzes' 
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 2a1 1 0 00-1 1v1H4a1 1 0 00-1 1v1a4 4 0 003 3.874V12a3 3 0 01-3 3H3a1 1 0 100 2h14a1 1 0 100-2h-.001A3 3 0 0114 12v-2.126A4.002 4.002 0 0017 6V5a1 1 0 00-1-1h-2V3a1 1 0 00-1-1H7zm7 4a2 2 0 01-1.555 1.946A1 1 0 0012 8v-.382A3.001 3.001 0 0110.528 5H14v1zM6 5h3.472A3.001 3.001 0 019 7.618V8a1 1 0 01-1.445.894A2 2 0 016 6V5z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/dashboard/leaderboard' 
    },
    { 
      id: 'reports', 
      label: 'Quiz Reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      href: '/dashboard/reports' 
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 3a2 2 0 012-2h4a2 2 0 012 2v2h2v2l-2.5 4H13l-1-2H8l-1 2H5.5L3 7V5h2V3zm3 2v2h2V5H9zm-4 6.5L6 16h8l1-4.5V9H5v2.5zM8 18l1 2h2l1-2H8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: '/dashboard/certificates',
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      href: '/dashboard/profile' 
    },
    { 
      id: 'coupons', 
      label: 'Apply Coupon', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8M5 4h14a1 1 0 011 1v3a2 2 0 010 4v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a2 2 0 010-4V5a1 1 0 011-1z" />
        </svg>
      ), 
      href: '/dashboard/coupons' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Hide sidebar on quiz attempt pages
  const isQuizAttemptPage = pathname?.includes('/quizzes/') && pathname?.match(/\/quizzes\/[^/]+\/?$/);
  
  return (
    <div className="min-h-screen bg-gray-50 flex print:bg-white">
      {/* Sidebar - Hidden on quiz attempt pages and in print */}
      {!isQuizAttemptPage && (
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen z-40 print:hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-xl font-bold text-white">Career Master</h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              {collapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeItem === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>
      </div>
      )}

      {/* Main Content — quiz attempts fill the viewport (no sidebar) */}
      <div
        className={`flex-1 transition-all duration-300 print:ml-0 ${
          isQuizAttemptPage
            ? 'ml-0 flex min-h-[100dvh] w-full flex-col'
            : collapsed
              ? 'ml-16'
              : 'ml-64'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

