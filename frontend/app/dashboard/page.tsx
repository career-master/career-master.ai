'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Initialize chart when component mounts
    if (typeof window !== 'undefined' && chartRef.current) {
      // @ts-ignore - Chart.js dynamic import
      import('chart.js/auto').then((ChartModule: any) => {
        const Chart = ChartModule.default || ChartModule;
        const ctx = chartRef.current?.getContext('2d');
        
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
        
        if (ctx && Chart) {
          chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
              datasets: [
                {
                  label: 'Accuracy',
                  data: [65, 70, 68, 75, 78, 80, 82],
                  borderColor: '#6f42c1',
                  backgroundColor: 'rgba(111, 66, 193, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Speed (Q/Hr)',
                  data: [42, 45, 48, 50, 52, 55, 58],
                  borderColor: '#20c997',
                  backgroundColor: 'rgba(32, 201, 151, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Knowledge Level',
                  data: [50, 55, 58, 62, 65, 68, 72],
                  borderColor: '#0dcaf0',
                  backgroundColor: 'rgba(13, 202, 240, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    color: '#374151',
                    font: {
                      size: 12,
                    },
                  },
                },
                title: {
                  display: true,
                  text: 'AI Performance Tracking',
                  color: '#1f2937',
                  font: {
                    size: 16,
                    weight: 'bold',
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#6b7280',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                y: {
                  beginAtZero: false,
                  min: 40,
                  max: 100,
                  ticks: {
                    color: '#6b7280',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
              },
            },
          });
        }
      });
    }
    
    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">CAREERMASTER.AI</h2>
              <span className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#8a6d00] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                AI PREMIUM
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 my-3">
        <div className="flex justify-center">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'dashboard', label: 'AI Dashboard', icon: 'home' },
              { id: 'mentor', label: 'AI Mentor', icon: 'robot' },
              { id: 'tests', label: 'Adaptive Tests', icon: 'file' },
              { id: 'analytics', label: 'Performance Analytics', icon: 'chart' },
              { id: 'library', label: 'Smart Library', icon: 'book' },
              { id: 'achievements', label: 'Achievements', icon: 'trophy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tab.icon === 'home' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  )}
                  {tab.icon === 'robot' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  )}
                  {tab.icon === 'file' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                  {tab.icon === 'chart' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  )}
                  {tab.icon === 'book' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  )}
                  {tab.icon === 'trophy' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  )}
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 my-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4 sticky top-4 border border-gray-100">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg text-gray-900 mb-1">{user?.name || 'User'}</h5>
                <p className="text-gray-600 text-sm mb-2 font-medium">Student</p>
                <span className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#8a6d00] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI PREMIUM
                </span>
              </div>

              <div className="mb-5">
                <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">AI Learning Profile</h6>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Knowledge Level</span>
                    <span className="text-sm font-bold text-gray-900">Intermediate</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Learning Speed</span>
                    <span className="text-sm font-bold text-gray-900">Fast</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Retention Rate</span>
                    <span className="text-sm font-bold text-gray-900">72%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Study Streak</h6>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Streak</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      7 days
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Longest Streak</span>
                    <span className="text-sm font-bold text-gray-900">21 days</span>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="font-bold mb-3 text-gray-900 text-sm uppercase tracking-wide">AI Features</h6>
                <div className="flex flex-wrap gap-2">
                  {['AI Mentor', 'Adaptive Learning', 'Smart Analytics', 'Instant Feedback'].map((feature) => (
                    <span key={feature} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-200">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5">
              <h6 className="font-bold mb-3">Quick Actions</h6>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'robot', label: 'AI Mentor' },
                  { icon: 'brain', label: 'Adaptive Test' },
                  { icon: 'bolt', label: 'Quick Quiz' },
                  { icon: 'chart', label: 'Progress' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                  >
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {action.icon === 'robot' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      )}
                      {action.icon === 'brain' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      )}
                      {action.icon === 'bolt' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      )}
                      {action.icon === 'chart' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      )}
                    </svg>
                    <div className="text-xs font-medium">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* AI Mentor Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border-l-4 border-purple-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50 rounded-bl-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="md:col-span-2">
                  <h4 className="text-2xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Your AI Learning Assistant
                  </h4>
                  <p className="text-gray-700 mb-4 text-base leading-relaxed">
                    Based on your performance, I've identified areas for improvement and created a personalized study plan.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Algebra Focus', 'Physics Practice', 'Speed Training'].map((tag) => (
                      <span key={tag} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105">
                    Chat with AI Mentor
                  </button>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="w-28 h-28 bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">AI Mentor v2.5</p>
                  <small className="text-green-600 font-semibold">Active now</small>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { title: 'AI Accuracy Score', value: '78%', change: '+5%', icon: 'bullseye', color: 'purple', bgColor: 'bg-purple-500', borderColor: 'border-purple-500' },
                { title: 'Learning Speed', value: '42s/Q', change: '+8%', icon: 'tachometer', color: 'green', bgColor: 'bg-green-500', borderColor: 'border-green-500' },
                { title: 'Knowledge Growth', value: '+24%', change: 'This month', icon: 'seedling', color: 'blue', bgColor: 'bg-blue-500', borderColor: 'border-blue-500' },
                { title: 'AI Rank', value: '#124', change: 'Improved 16 positions', icon: 'trophy', color: 'yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' },
              ].map((stat) => (
                <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-5 border-t-4 ${stat.borderColor} hover:shadow-xl transition-all`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h6 className="text-gray-600 text-xs mb-2 font-semibold uppercase tracking-wide">{stat.title}</h6>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        {stat.icon === 'bullseye' && (
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        )}
                        {stat.icon === 'tachometer' && (
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        )}
                        {stat.icon === 'seedling' && (
                          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm9 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                        )}
                        {stat.icon === 'trophy' && (
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        )}
                      </svg>
                    </div>
                  </div>
                  <small className="text-green-600 text-xs">
                    <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {stat.change}
                  </small>
                </div>
              ))}
            </div>

            {/* AI Recommendations & Weakness Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-gray-900">AI-Powered Recommendations</h4>
                  <button className="text-sm text-purple-600 hover:underline font-semibold">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Algebra Focus Test', desc: 'Targets your weak areas in quadratic equations', badge: 'AI Customized', icon: 'calculator', color: 'purple', bgColor: 'bg-purple-500', borderColor: 'border-purple-500' },
                    { title: 'Biology Revision', desc: 'Focus on genetics and evolution concepts', badge: '15 min', icon: 'dna', color: 'green', bgColor: 'bg-green-500', borderColor: 'border-green-500' },
                    { title: 'Speed Challenge', desc: 'Improve your problem-solving speed', badge: 'Time Trial', icon: 'bolt', color: 'blue', bgColor: 'bg-blue-500', borderColor: 'border-blue-500' },
                    { title: 'Concept Mastery', desc: 'Advanced physics concepts', badge: 'Master Level', icon: 'puzzle', color: 'yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' },
                  ].map((rec) => (
                    <div key={rec.title} className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${rec.borderColor} relative overflow-hidden hover:shadow-xl transition-all`}>
                      <div className="absolute top-3 -right-8 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white text-xs px-8 py-1.5 transform rotate-45 shadow-lg font-bold">
                        AI RECOMMENDED
                      </div>
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-12 h-12 ${rec.bgColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            {rec.icon === 'calculator' && (
                              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            )}
                            {rec.icon === 'dna' && (
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            )}
                            {rec.icon === 'bolt' && (
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            )}
                            {rec.icon === 'puzzle' && (
                              <path d="M10 2a4 4 0 104 4V4a2 2 0 00-2-2h-2zM4 6a2 2 0 012-2h2v2a4 4 0 11-4 4zm12 8a2 2 0 01-2 2h-2v-2a4 4 0 10-4-4v2a2 2 0 102 2h2zm-6-4a2 2 0 100-4 2 2 0 000 4z" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h6 className="font-bold mb-2 text-gray-900 text-base">{rec.title}</h6>
                          <small className="text-gray-700 text-sm leading-relaxed">{rec.desc}</small>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200">{rec.badge}</span>
                        <button className="bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105">
                          Start Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h5 className="font-bold mb-3 text-gray-900 text-lg">Weakness Analysis</h5>
                <p className="text-gray-700 text-sm mb-4 font-medium">Based on 42 tests and 1,250 questions answered</p>
                {[
                  { subject: 'Algebra', percentage: 65, color: 'red', bgColor: 'bg-red-500' },
                  { subject: 'Geometry', percentage: 42, color: 'yellow', bgColor: 'bg-yellow-500' },
                  { subject: 'Physics', percentage: 78, color: 'green', bgColor: 'bg-green-500' },
                  { subject: 'Chemistry', percentage: 55, color: 'blue', bgColor: 'bg-blue-500' },
                ].map((item) => (
                  <div key={item.subject} className="mb-4">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-800 font-semibold">{item.subject}</span>
                      <span className="font-bold text-gray-900 text-base">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full ${item.bgColor} rounded-full shadow-sm`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-4 border-2 border-purple-600 text-purple-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-50 transition-all">
                  Detailed Report
                </button>
              </div>
            </div>

            {/* Adaptive Learning Path & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl shadow-md p-5">
                <h5 className="font-bold mb-3 text-gray-900">Your Adaptive Learning Path</h5>
                <p className="text-gray-600 text-sm mb-3">AI-generated personalized learning journey</p>
                {[
                  { title: 'Quadratic Equations', desc: 'Master the fundamentals', time: '45 min', status: 'current' },
                  { title: 'Trigonometry Basics', desc: 'Build on previous concepts', time: '60 min', status: 'pending' },
                  { title: 'Advanced Algebra', desc: 'Complex problem solving', time: '90 min', status: 'pending' },
                  { title: 'Basic Arithmetic', desc: 'Completed 2 days ago', time: '100%', status: 'completed' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg border-l-4 ${
                      item.status === 'current'
                        ? 'border-green-500 bg-green-50'
                        : item.status === 'completed'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-gray-50'
                    } hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === 'current'
                          ? 'bg-green-500 text-white'
                          : item.status === 'completed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {item.status === 'current' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      )}
                      {item.status === 'completed' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.status === 'pending' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-900">{item.title}</h6>
                      <small className="text-gray-600 text-xs">{item.desc}</small>
                    </div>
                    <div className="text-right">
                      <small className="text-gray-600 text-xs font-medium">{item.time}</small>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-3 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                  Continue Learning Path
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-bold text-gray-900">AI Performance Analytics</h5>
                  <div className="flex gap-1">
                    {['7 Days', '30 Days', '90 Days'].map((period) => (
                      <button
                        key={period}
                        className="px-2 py-1 text-xs border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[250px]">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            </div>

            {/* AI Predictions & Recent Tests */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-pink-500">
                <h5 className="font-bold mb-3 text-gray-900">AI Performance Prediction</h5>
                <p className="text-gray-600 text-sm mb-4">Based on your current progress</p>
                {[
                  { label: 'Next Test Score', value: 82 },
                  { label: 'Exam Readiness', value: 74 },
                  { label: 'Knowledge Growth', value: 68 },
                ].map((pred) => (
                  <div key={pred.label} className="mb-4">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-700 font-medium">{pred.label}</span>
                      <span className="font-bold text-gray-900">{pred.value}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] rounded-full transition-all duration-1500"
                        style={{ width: `${pred.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-3 border border-purple-600 text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">
                  View Detailed Predictions
                </button>
              </div>

              <div className="md:col-span-2 bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-bold text-gray-900">Recent AI Tests</h5>
                  <button className="text-sm text-purple-600 hover:underline font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-semibold text-gray-900">Test</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-900">Type</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-900">Score</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-900">AI Feedback</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { test: 'Algebra Focus', type: 'Adaptive', score: 85, feedback: 'Good Progress', typeBg: 'bg-purple-100', typeText: 'text-purple-700' },
                        { test: 'Physics Challenge', type: 'Time Trial', score: 72, feedback: 'Needs Practice', typeBg: 'bg-yellow-100', typeText: 'text-yellow-700' },
                        { test: 'Chemistry Mastery', type: 'Concept', score: 91, feedback: 'Excellent', typeBg: 'bg-blue-100', typeText: 'text-blue-700' },
                        { test: 'Speed Math', type: 'Buzzer', score: 65, feedback: 'Focus Area', typeBg: 'bg-red-100', typeText: 'text-red-700' },
                      ].map((row) => (
                        <tr key={row.test} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-sm text-gray-900 font-medium">{row.test}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${row.typeBg} ${row.typeText}`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              row.score >= 80 ? 'bg-green-100 text-green-700' : row.score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {row.score}%
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              row.feedback === 'Excellent' || row.feedback === 'Good Progress'
                                ? 'bg-green-100 text-green-700'
                                : row.feedback === 'Needs Practice'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {row.feedback}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="text-sm text-purple-600 hover:underline font-medium">Review</button>
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

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
