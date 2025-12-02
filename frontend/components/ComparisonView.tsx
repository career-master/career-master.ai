'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ComparisonData {
  userRank: number | null;
  totalUsers: number;
  userData: {
    userId: string;
    name: string;
    averageScore: number;
    totalMarksObtained: number;
    totalAttempts: number;
    bestScore: number;
    passRate: number;
    accuracy: number;
  } | null;
  aboveUsers: Array<{
    userId: string;
    name: string;
    averageScore: number;
    totalMarksObtained: number;
    totalAttempts: number;
    rank: number;
  }>;
  belowUsers: Array<{
    userId: string;
    name: string;
    averageScore: number;
    totalMarksObtained: number;
    totalAttempts: number;
    rank: number;
  }>;
}

export default function ComparisonView() {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComparison = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const res = await apiService.getUserRankAndComparison(user._id);
          if (res.success && res.data) {
            setComparisonData(res.data);
          }
        }
      } catch (error) {
        console.error('Failed to load comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadComparison();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!comparisonData || !comparisonData.userData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Your Performance</h3>
        <p className="text-gray-600 text-sm">Start taking quizzes to see your comparison with others!</p>
      </div>
    );
  }

  const { userData, aboveUsers, belowUsers, userRank, totalUsers } = comparisonData;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Performance Comparison
      </h3>

      {/* User's Rank Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Your Rank</p>
            <p className="text-3xl font-bold text-purple-600">
              #{userRank || 'N/A'}
              <span className="text-sm font-normal text-gray-600 ml-2">
                of {totalUsers} users
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {userData.averageScore.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Attempts</p>
          <p className="text-lg font-bold text-gray-900">{userData.totalAttempts}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Best Score</p>
          <p className="text-lg font-bold text-gray-900">{userData.bestScore.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Pass Rate</p>
          <p className="text-lg font-bold text-gray-900">{userData.passRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Accuracy</p>
          <p className="text-lg font-bold text-gray-900">{userData.accuracy.toFixed(1)}%</p>
        </div>
      </div>

      {/* Users Above You */}
      {aboveUsers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Users Above You
          </h4>
          <div className="space-y-2">
            {aboveUsers.map((u) => (
              <div key={u.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
                    #{u.rank}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.totalAttempts} attempts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{u.averageScore.toFixed(1)}%</p>
                  <p className="text-xs text-green-600">
                    +{(u.averageScore - userData.averageScore).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Performance */}
      <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              #{userRank}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userData.name} (You)</p>
              <p className="text-xs text-gray-600">{userData.totalAttempts} attempts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-blue-600">{userData.averageScore.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">Your average</p>
          </div>
        </div>
      </div>

      {/* Users Below You */}
      {belowUsers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Users Below You
          </h4>
          <div className="space-y-2">
            {belowUsers.map((u) => (
              <div key={u.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                    #{u.rank}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.totalAttempts} attempts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{u.averageScore.toFixed(1)}%</p>
                  <p className="text-xs text-red-600">
                    {(userData.averageScore - u.averageScore).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

