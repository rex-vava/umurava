'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/jobsSlice';
import { PageLoader } from '@/components/LoadingStates';
import StatCard from '@/components/StatCard';
import { DashboardStats } from '@/types';
import {
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.jobs);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await dispatch(fetchDashboardStats()).unwrap();
        setStats(result);
      } catch (error) {
        setStats(null);
      }
    };
    load();
  }, [dispatch]);

  if (loading || !stats) return <PageLoader />;

  const maxScreenings = Math.max(...(stats.screeningsByDay?.map((d) => d.count) || [1]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your recruiting performance and AI screening insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs || 0}
          icon={<BriefcaseIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates || 0}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Screenings"
          value={stats.screenedCandidates || 0}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Average Score"
          value={stats.averageScore ? `${Math.round(stats.averageScore)}%` : '0%'}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Screenings by Day */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Screenings Over Time</h2>
          </div>
          {stats.screeningsByDay?.length > 0 ? (
            <div className="space-y-2">
              {stats.screeningsByDay.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{day.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="h-6 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((day.count / maxScreenings) * 100, 10)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No screening data yet</p>
          )}
        </div>

        {/* Score Distribution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Score Distribution</h2>
          </div>
          {stats.scoreDistribution?.length > 0 ? (
            <div className="flex items-end gap-3 h-48 px-4">
              {stats.scoreDistribution.map((bucket) => {
                const maxCount = Math.max(...stats.scoreDistribution.map((b) => b.count));
                const height = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                const getColor = (range: string) => {
                  if (range.startsWith('0') || range.startsWith('1') || range.startsWith('2')) return 'bg-red-400';
                  if (range.startsWith('3') || range.startsWith('4')) return 'bg-yellow-400';
                  if (range.startsWith('5') || range.startsWith('6')) return 'bg-blue-400';
                  return 'bg-green-400';
                };
                return (
                  <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-700">{bucket.count}</span>
                    <div
                      className={`w-full rounded-t ${getColor(bucket.range)} transition-all`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 mt-1">{bucket.range}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No score data yet</p>
          )}
        </div>
      </div>

      {/* Top Skills */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Top Skills Across Candidates</h2>
        </div>
        {stats.topSkills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((skill, i: number) => {
              const sizes = ['text-lg px-4 py-2', 'text-base px-3 py-1.5', 'text-sm px-2.5 py-1'];
              const sizeClass = i < 3 ? sizes[0] : i < 8 ? sizes[1] : sizes[2];
              const colors = [
                'bg-primary-100 text-primary-700',
                'bg-purple-100 text-purple-700',
                'bg-green-100 text-green-700',
                'bg-blue-100 text-blue-700',
                'bg-orange-100 text-orange-700',
              ];
              return (
                <span
                  key={skill.skill}
                  className={`${sizeClass} ${colors[i % colors.length]} rounded-full font-medium`}
                >
                  {skill.skill} ({skill.count})
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No skill data yet</p>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 text-center">
          <CheckBadgeIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">
            {stats.shortlistedCandidates || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Shortlisted Candidates</p>
        </div>
        <div className="card p-6 text-center">
          <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalCandidates && stats.screenedCandidates
              ? `${Math.round((stats.screenedCandidates / stats.totalCandidates) * 100)}%`
              : '0%'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Screening Coverage</p>
        </div>
        <div className="card p-6 text-center">
          <SparklesIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeJobs || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Active Jobs</p>
        </div>
      </div>
    </div>
  );
}
