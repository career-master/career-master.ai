'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDashboardStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overview, growth, charts, recentUsers } = stats;

  // User Growth Chart Data
  const userGrowthData = {
    labels: charts.userGrowth.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'New Users',
        data: charts.userGrowth.map((d: any) => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Quiz Growth Chart Data
  const quizGrowthData = {
    labels: charts.quizGrowth.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'New Quizzes',
        data: charts.quizGrowth.map((d: any) => d.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Users by Role Chart Data
  const usersByRoleData = {
    labels: charts.usersByRole.map((r: any) => r.role.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Users',
        data: charts.usersByRole.map((r: any) => r.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  // Batch Distribution Chart Data
  const batchDistributionData = {
    labels: charts.batchDistribution.slice(0, 5).map((b: any) => b.name),
    datasets: [
      {
        label: 'Students',
        data: charts.batchDistribution.slice(0, 5).map((b: any) => b.studentCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  // Quiz Assignment Chart Data
  const quizAssignmentData = {
    labels: ['With Batches', 'Without Batches'],
    datasets: [
      {
        data: [charts.quizzesByBatch.withBatches, charts.quizzesByBatch.withoutBatches],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-blue-500 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h6 className="text-gray-600 text-xs mb-1 font-semibold uppercase tracking-wide">Total Users</h6>
              <h3 className="text-2xl font-bold text-gray-900">{overview.totalUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <small className="text-green-600 text-xs font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {growth.usersThisWeek} this week
            </small>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-green-500 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h6 className="text-gray-600 text-xs mb-1 font-semibold uppercase tracking-wide">Total Quizzes</h6>
              <h3 className="text-2xl font-bold text-gray-900">{overview.totalQuizzes}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <small className="text-green-600 text-xs font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {growth.quizzesThisWeek} this week
            </small>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-cyan-500 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h6 className="text-gray-600 text-xs mb-1 font-semibold uppercase tracking-wide">Total Batches</h6>
              <h3 className="text-2xl font-bold text-gray-900">{overview.totalBatches}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <small className="text-gray-600 text-xs font-semibold">
              {overview.activeBatches} active
            </small>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-yellow-500 hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h6 className="text-gray-600 text-xs mb-1 font-semibold uppercase tracking-wide">Active Users</h6>
              <h3 className="text-2xl font-bold text-gray-900">{overview.activeUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <small className="text-green-600 text-xs font-semibold">
              {((overview.activeUsers / overview.totalUsers) * 100).toFixed(1)}% of total
            </small>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold text-gray-900 mb-4">User Growth (Last 7 Days)</h5>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Quiz Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold text-gray-900 mb-4">Quiz Growth (Last 7 Days)</h5>
          <div className="h-64">
            <Line data={quizGrowthData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold text-gray-900 mb-4">Users by Role</h5>
          <div className="h-64">
            <Doughnut data={usersByRoleData} options={chartOptions} />
          </div>
        </div>

        {/* Batch Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold text-gray-900 mb-4">Top Batches by Students</h5>
          <div className="h-64">
            <Bar data={batchDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Quiz Assignment */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold text-gray-900 mb-4">Quiz Assignment</h5>
          <div className="h-64">
            <Doughnut data={quizAssignmentData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Users */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Quick Actions */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'User Management', desc: 'Manage all users and permissions', icon: 'user-plus', color: 'blue', href: '/admin/users' },
              { title: 'Question Bank', desc: 'Create and manage quizzes for users', icon: 'database', color: 'green', href: '/admin/quizzes' },
              { title: 'Batch Management', desc: 'Manage student batches', icon: 'users', color: 'cyan', href: '/admin/batches' },
              { title: 'Analytics', desc: 'View platform analytics', icon: 'chart', color: 'yellow', href: '/admin/reports' },
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
                      {action.icon === 'users' && (
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
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
                <Link
                  href={action.href}
                  className="w-full inline-flex justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Manage {action.title.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h5 className="font-bold mb-4 text-gray-900">Recent Activity</h5>
          <div className="space-y-4">
            {[
              { type: 'user', text: `${growth.usersThisWeek} new users this week`, time: 'Updated now' },
              { type: 'system', text: `${growth.quizzesThisWeek} new quizzes created`, time: 'Updated now' },
              { type: 'info', text: `${overview.activeQuizzes} active quizzes`, time: 'Live' },
              { type: 'info', text: `${overview.activeBatches} active batches`, time: 'Live' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'system' ? 'bg-green-100 text-green-600' :
                  'bg-cyan-100 text-cyan-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    {activity.type === 'user' && (
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    )}
                    {activity.type === 'system' && (
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    )}
                    {activity.type === 'info' && (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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
          <Link
            href="/admin/users"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            View All Users
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Joined</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No users yet</td>
                </tr>
              ) : (
                recentUsers.map((user: any, idx: number) => (
                  <tr key={user._id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.roles?.[0] === 'student' ? 'bg-blue-100 text-blue-700' :
                        user.roles?.[0] === 'institution_admin' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.roles?.[0] || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.joined).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/users/new?id=${user._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
