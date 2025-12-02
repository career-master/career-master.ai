'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface TopPerformer {
  userId: string;
  name: string;
  email: string;
  rank: number;
  averageScore: number;
  totalMarksObtained: number;
  totalMarksPossible: number;
  totalAttempts: number;
  bestScore: number;
  passRate: number;
  accuracy: number;
}

interface UserRankData {
  userRank: number | null;
  totalUsers: number;
  userData: TopPerformer | null;
  aboveUsers: TopPerformer[];
  belowUsers: TopPerformer[];
}

export default function LeaderboardCard() {
  const { user } = useAuth();
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [userRankData, setUserRankData] = useState<UserRankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Get top 10 performers
        try {
          const topRes = await apiService.getTopPerformers({ limit: 10 });
          if (topRes.success && topRes.data) {
            setTopPerformers(topRes.data);
          }
        } catch (error: any) {
          // Route might not be available yet, silently fail
          console.log('Leaderboard not available:', error?.message || 'Route not found');
        }

        // Get user's rank and comparison
        if (user?._id) {
          try {
            const rankRes = await apiService.getUserRankAndComparison(user._id);
            if (rankRes.success && rankRes.data) {
              setUserRankData(rankRes.data);
            }
          } catch (error: any) {
            // Route might not be available yet, silently fail
            console.log('User rank not available:', error?.message || 'Route not found');
          }
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadLeaderboard();
    }
  }, [user]);

  const topThree = topPerformers.slice(0, 3);
  const podiumOrder = topThree.length >= 3 
    ? [topThree[1], topThree[0], topThree[2]] 
    : topThree;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Top Performers
        </h3>
      </div>

      {/* Podium Section */}
      {topThree.length >= 3 && (
        <div className="mb-4">
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((player, index) => {
              const heights = ['h-12', 'h-16', 'h-10'];
              const configs = [
                { bg: 'bg-gradient-to-t from-gray-400 to-gray-300', text: 'text-gray-600', border: 'border-gray-400' },
                { bg: 'bg-gradient-to-t from-amber-400 to-amber-300', text: 'text-amber-600', border: 'border-amber-400' },
                { bg: 'bg-gradient-to-t from-orange-400 to-orange-300', text: 'text-orange-600', border: 'border-orange-400' }
              ];
              const config = configs[index];
              const position = index === 0 ? 2 : index === 1 ? 1 : 3;

              return (
                <div key={player.userId} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${config.border} shadow-lg mb-2 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center mb-2">
                    <p className="text-xs font-semibold text-gray-900 truncate max-w-[60px]">
                      {player.name.split(' ')[0]}
                    </p>
                    <p className={`text-xs font-normal ${config.text}`}>
                      {player.averageScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`w-16 ${heights[index]} ${config.bg} rounded-t-lg flex items-end justify-center pb-2`}>
                    <span className={`text-xl font-semibold ${config.text} opacity-70`}>
                      {position}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Section */}
      {userRankData?.userData && (
        <div className="mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-blue-100 font-semibold text-lg">
                {userRankData.userData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userRankData.userData.name} (You)
              </p>
              <p className="text-xs font-normal text-gray-600">
                {userRankData.userData.averageScore.toFixed(1)}% Avg
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-blue-600">
                #{userRankData.userRank || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                of {userRankData.totalUsers}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers List */}
      {topPerformers.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {topPerformers.slice(3, 8).map((performer) => (
              <div
                key={performer.userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                  performer.rank === 1 ? 'bg-amber-500' :
                  performer.rank === 2 ? 'bg-gray-500' :
                  performer.rank === 3 ? 'bg-orange-600' :
                  'bg-purple-500'
                }`}>
                  {performer.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {performer.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {performer.totalAttempts} attempts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {performer.averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Full Leaderboard Button */}
      <button
        onClick={() => setShowFullLeaderboard(true)}
        className="w-full border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-all"
      >
        View Full Leaderboard
      </button>

      {/* Full Leaderboard Modal */}
      {showFullLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Full Leaderboard</h3>
              <button
                onClick={() => setShowFullLeaderboard(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.userId}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      performer.userId === user?._id ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      performer.rank === 1 ? 'bg-amber-500' :
                      performer.rank === 2 ? 'bg-gray-500' :
                      performer.rank === 3 ? 'bg-orange-600' :
                      'bg-purple-500'
                    }`}>
                      {performer.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {performer.name}
                        {performer.userId === user?._id && ' (You)'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {performer.totalAttempts} attempts • {performer.passRate.toFixed(1)}% pass rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {performer.averageScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">
                        Best: {performer.bestScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

