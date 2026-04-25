'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJobs, deleteJob } from '@/store/slices/jobsSlice';
import { PageLoader, EmptyState } from '@/components/LoadingStates';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserGroupIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const statusFilters = ['all', 'active', 'draft', 'paused', 'closed'];

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading, pagination } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchJobs({ search, status: statusFilter }));
  }, [dispatch, search, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" and all its candidates? This cannot be undone.`)) return;
    try {
      await dispatch(deleteJob(id)).unwrap();
      toast.success('Job deleted successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to delete job');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'badge-green',
      draft: 'badge-gray',
      paused: 'badge-yellow',
      closed: 'badge-red',
    };
    return map[status] || 'badge-gray';
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      'full-time': 'badge-blue',
      'part-time': 'badge-purple',
      contract: 'badge-yellow',
      internship: 'badge-green',
      remote: 'badge-green',
    };
    return map[type] || 'badge-gray';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and track candidates</p>
        </div>
        <Link href="/dashboard/jobs/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs by title, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={search ? 'Try adjusting your search filters' : 'Create your first job posting to start screening candidates'}
          action={
            !search ? (
              <Link href="/dashboard/jobs/new" className="btn-primary">
                Post Your First Job
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="card p-6 hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={getStatusBadge(job.status)}>{job.status}</span>
                    <span className={getTypeBadge(job.type)}>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      {job.totalCandidates} candidates
                    </span>
                    {job.department && (
                      <span className="text-gray-400">• {job.department}</span>
                    )}
                  </div>
                  {job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requirements.slice(0, 4).map((req, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {req.length > 40 ? req.substring(0, 40) + '...' : req}
                        </span>
                      ))}
                      {job.requirements.length > 4 && (
                        <span className="text-xs text-gray-400">+{job.requirements.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/dashboard/jobs/${job._id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/dashboard/jobs/${job._id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(job._id, job.title)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Screening progress</span>
                  <span className="font-medium text-gray-700">
                    {job.screenedCandidates}/{job.totalCandidates} screened
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500 transition-all"
                    style={{
                      width: `${job.totalCandidates ? (job.screenedCandidates / job.totalCandidates) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch(fetchJobs({ page: i + 1, search, status: statusFilter }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
