'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/jobsSlice';
import { fetchJobs } from '@/store/slices/jobsSlice';
import StatCard from '@/components/StatCard';
import { PageLoader } from '@/components/LoadingStates';
import { DashboardStats } from '@/types';
import {
  BriefcaseIcon,
  UsersIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { jobs } = useAppSelector((state) => state.jobs);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResult] = await Promise.all([
          dispatch(fetchDashboardStats()).unwrap(),
          dispatch(fetchJobs({ limit: 5 })),
        ]);
        setStats(statsResult);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [dispatch]);

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your recruitment pipeline.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon={<BriefcaseIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          icon={<BriefcaseIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Candidates"
          value={stats?.totalCandidates || 0}
          icon={<UsersIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Screened"
          value={stats?.screenedCandidates || 0}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Shortlisted"
          value={stats?.shortlistedCandidates || 0}
          icon={<CheckBadgeIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Avg. Score"
          value={stats?.averageScore || 0}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/dashboard/jobs" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View All →
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs yet</p>
              <Link href="/dashboard/jobs/new" className="btn-primary mt-4 inline-block text-sm">
                Create Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <Link
                  key={job._id}
                  href={`/dashboard/jobs/${job._id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      job.status === 'active' ? 'badge-green' :
                      job.status === 'paused' ? 'badge-yellow' :
                      job.status === 'closed' ? 'badge-red' : 'badge-gray'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{job.totalCandidates} candidates</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Skills */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Candidate Skills</h2>
            <Link href="/dashboard/analytics" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              Analytics →
            </Link>
          </div>
          {stats?.topSkills && stats.topSkills.length > 0 ? (
            <div className="space-y-4">
              {stats.topSkills.map((skill, index) => (
                <div key={skill.skill} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-400 w-6">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                      <span className="text-sm text-gray-500">{skill.count} candidates</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                        style={{ width: `${(skill.count / (stats.topSkills[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowTrendingUpIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No data yet. Upload candidates to see skill analytics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/jobs/new" className="btn-primary flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5" />
            Post New Job
          </Link>
          <Link href="/dashboard/candidates" className="btn-secondary flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            View Candidates
          </Link>
          <Link href="/dashboard/screening" className="btn-secondary flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            AI Screening
          </Link>
        </div>
      </div>
    </div>
  );
}
