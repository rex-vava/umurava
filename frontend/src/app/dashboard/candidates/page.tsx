'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCandidates, updateCandidateStatus } from '@/store/slices/candidatesSlice';
import { fetchJobs } from '@/store/slices/jobsSlice';
import { screenCandidate } from '@/store/slices/screeningSlice';
import { PageLoader, EmptyState } from '@/components/LoadingStates';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const statusOptions = ['all', 'new', 'screening', 'screened', 'shortlisted', 'interview', 'rejected', 'hired'];

export default function CandidatesPage() {
  const dispatch = useAppDispatch();
  const { candidates, loading, pagination } = useAppSelector((state) => state.candidates);
  const { jobs } = useAppSelector((state) => state.jobs);
  const { screening: isScreening } = useAppSelector((state) => state.screening);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('');
  const [screeningId, setScreeningId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCandidates({
      search,
      status: statusFilter,
      jobId: jobFilter || undefined,
    }));
  }, [dispatch, search, statusFilter, jobFilter]);

  const handleScreen = async (candidateId: string) => {
    setScreeningId(candidateId);
    toast.loading('AI is analyzing the resume...', { id: 'screen' });
    try {
      await dispatch(screenCandidate(candidateId)).unwrap();
      toast.success('Screening complete!', { id: 'screen' });
      dispatch(fetchCandidates({ search, status: statusFilter, jobId: jobFilter || undefined }));
    } catch (err: any) {
      toast.error(err || 'Screening failed', { id: 'screen' });
    } finally {
      setScreeningId(null);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await dispatch(updateCandidateStatus({ id: candidateId, status: newStatus })).unwrap();
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      new: 'badge-gray',
      screening: 'badge-yellow',
      screened: 'badge-blue',
      shortlisted: 'badge-green',
      interview: 'badge-purple',
      rejected: 'badge-red',
      hired: 'bg-emerald-100 text-emerald-800',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">View and manage all candidates across jobs</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UserGroupIcon className="w-5 h-5" />
          {pagination.total} total candidates
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
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

      {/* Candidates Table */}
      {loading ? (
        <PageLoader />
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description={search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Upload resumes from a job page to add candidates'}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Skills</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const jobInfo = typeof candidate.job === 'object' ? candidate.job : null;
                return (
                  <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                          {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-700">{jobInfo?.title || '—'}</p>
                      <p className="text-xs text-gray-400">{jobInfo?.company || ''}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-xs text-gray-400">+{candidate.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(candidate.status)}`}
                      >
                        {statusOptions.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {candidate.status === 'new' && (
                        <button
                          onClick={() => handleScreen(candidate._id)}
                          disabled={isScreening && screeningId === candidate._id}
                          className="text-xs btn-primary py-1.5 px-3 flex items-center gap-1 ml-auto"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {screeningId === candidate._id ? 'Screening...' : 'Screen'}
                        </button>
                      )}
                      {(candidate.status === 'screened' || candidate.status === 'shortlisted') && (
                        <Link
                          href={`/dashboard/candidates/${candidate._id}`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Results →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
