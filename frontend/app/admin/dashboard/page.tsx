'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!isAuthenticated || !user?.roles?.includes('super_admin')) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">CAREERMASTER.AI</h2>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SUPER ADMIN
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">{user?.name || 'System Admin'}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 hidden group-hover:block z-50">
                  <Link href="/admin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      System Settings
                    </div>
                  </Link>
                  <Link href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Admin Users
                    </div>
                  </Link>
                  <hr className="my-2" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 my-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 sticky top-4">
              <h5 className="font-bold mb-4 text-gray-900">Admin Panel</h5>
              
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: 'tachometer' },
                  { id: 'users', label: 'User Management', icon: 'users' },
                  { id: 'institutions', label: 'Institutions', icon: 'university' },
                  { id: 'questions', label: 'Questions Bank', icon: 'database' },
                  { id: 'tests', label: 'Test Engine', icon: 'file' },
                  { id: 'content', label: 'Content Library', icon: 'book' },
                  { id: 'payments', label: 'Payments & Subscription', icon: 'credit-card' },
                  { id: 'analytics', label: 'AI Analytics', icon: 'robot' },
                  { id: 'settings', label: 'Settings', icon: 'cogs' },
                  { id: 'logs', label: 'Logs', icon: 'clipboard' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeMenu === item.id
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      {item.icon === 'tachometer' && (
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      )}
                      {item.icon === 'users' && (
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      )}
                      {item.icon === 'university' && (
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      )}
                      {item.icon === 'database' && (
                        <>
                          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                        </>
                      )}
                      {item.icon === 'file' && (
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      )}
                      {item.icon === 'book' && (
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      )}
                      {item.icon === 'credit-card' && (
                        <>
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </>
                      )}
                      {item.icon === 'robot' && (
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      )}
                      {item.icon === 'cogs' && (
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      )}
                      {item.icon === 'clipboard' && (
                        <>
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </>
                      )}
                    </svg>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* System Health */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h6 className="font-bold mb-4 text-gray-900">System Health</h6>
                
                {[
                  { name: 'API Server', status: 'online', percentage: 95 },
                  { name: 'Database', status: 'online', percentage: 87 },
                  { name: 'AI Engine', status: 'warning', percentage: 72 },
                  { name: 'CDN', status: 'online', percentage: 98 },
                ].map((server) => (
                  <div key={server.name} className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        server.status === 'online' ? 'bg-green-500' : 
                        server.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1 flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{server.name}</span>
                        <span className="text-gray-500">{server.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          server.status === 'online' ? 'bg-green-500' : 
                          server.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${server.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { title: 'Total Users', value: '12,458', change: '342 this week', icon: 'users', color: 'blue' },
                { title: 'Institutions', value: '187', change: '5 this week', icon: 'university', color: 'green' },
                { title: 'Active Tests', value: '42', change: '8 this week', icon: 'file', color: 'cyan' },
                { title: 'Revenue', value: '$24,582', change: '12% this month', icon: 'dollar', color: 'yellow' },
              ].map((stat) => (
                <div key={stat.title} className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-red-600 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <h6 className="text-gray-600 text-xs mb-1 font-semibold uppercase tracking-wide">{stat.title}</h6>
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-500' :
                      stat.color === 'green' ? 'bg-green-500' :
                      stat.color === 'cyan' ? 'bg-cyan-500' : 'bg-yellow-500'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        {stat.icon === 'users' && (
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        )}
                        {stat.icon === 'university' && (
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        )}
                        {stat.icon === 'file' && (
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        )}
                        {stat.icon === 'dollar' && (
                          <>
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.379 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.379-1.253V5z" clipRule="evenodd" />
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2">
                    <small className="text-green-600 text-xs font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {stat.change}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Quick Actions */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'User Management', desc: 'Manage all users and permissions', icon: 'user-plus', color: 'blue' },
                    { title: 'Question Bank', desc: 'Add or review questions', icon: 'database', color: 'green' },
                    { title: 'System Settings', desc: 'Configure platform settings', icon: 'cogs', color: 'cyan' },
                    { title: 'Analytics', desc: 'View platform analytics', icon: 'chart', color: 'yellow' },
                  ].map((action) => (
                    <div key={action.title} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          action.color === 'blue' ? 'bg-blue-500' :
                          action.color === 'green' ? 'bg-green-500' :
                          action.color === 'cyan' ? 'bg-cyan-500' : 'bg-yellow-500'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            {action.icon === 'user-plus' && (
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            )}
                            {action.icon === 'database' && (
                              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                            )}
                            {action.icon === 'cogs' && (
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            )}
                            {action.icon === 'chart' && (
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 mb-1">{action.title}</h5>
                          <p className="text-gray-600 text-sm">{action.desc}</p>
                        </div>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Manage {action.title.split(' ')[0]}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h5 className="font-bold mb-4 text-gray-900">Recent Activity</h5>
                
                <div className="space-y-4">
                  {[
                    { type: 'user', text: 'New user registered: John Smith', time: '2 minutes ago' },
                    { type: 'system', text: 'System backup completed', time: '1 hour ago' },
                    { type: 'warning', text: 'AI Engine load at 85%', time: '3 hours ago' },
                    { type: 'user', text: 'New institution registered: ABC College', time: '5 hours ago' },
                    { type: 'system', text: 'AI model updated to v2.3', time: 'Yesterday' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'system' ? 'bg-green-100 text-green-600' :
                        activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          {activity.type === 'user' && (
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                          )}
                          {activity.type === 'system' && (
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          )}
                          {activity.type === 'warning' && (
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium mb-1">{activity.text}</p>
                        <small className="text-gray-500 text-xs">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h5 className="font-bold text-gray-900">Recent Users</h5>
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                  View All Users
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Joined</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#CM1254', name: 'John Smith', email: 'john@example.com', role: 'Student', status: 'Active', joined: '2023-10-15' },
                      { id: '#CM1253', name: 'Sarah Johnson', email: 'sarah@college.edu', role: 'Teacher', status: 'Active', joined: '2023-10-14' },
                      { id: '#CM1252', name: 'Robert Brown', email: 'robert@example.com', role: 'Student', status: 'Pending', joined: '2023-10-13' },
                      { id: '#CM1251', name: 'ABC College', email: 'admin@abccollege.edu', role: 'Institution', status: 'Active', joined: '2023-10-12' },
                      { id: '#CM1250', name: 'Michael Davis', email: 'michael@example.com', role: 'Student', status: 'Blocked', joined: '2023-10-10' },
                    ].map((user, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'Student' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'Teacher' ? 'bg-cyan-100 text-cyan-700' :
                            user.role === 'Institution' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.status === 'Active' ? 'bg-green-100 text-green-700' :
                            user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joined}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            {user.status === 'Blocked' ? (
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">Unblock</button>
                            ) : (
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">Block</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

