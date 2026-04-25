'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJobs } from '@/store/slices/jobsSlice';
import {
  screenAllCandidates,
  fetchScreeningResults,
  fetchShortlist,
  compareCandidates,
} from '@/store/slices/screeningSlice';
import { fetchCandidates } from '@/store/slices/candidatesSlice';
import { PageLoader, EmptyState, ScreeningLoader } from '@/components/LoadingStates';
import { ScoreGauge, RecommendationBadge } from '@/components/ScreeningResults';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ScreeningPage() {
  const dispatch = useAppDispatch();
  const { jobs } = useAppSelector((state) => state.jobs);
  const { candidates } = useAppSelector((state) => state.candidates);
  const { screenings, shortlist, comparison, loading, screening: isScreening } = useAppSelector(
    (state) => state.screening
  );
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedJob) {
      dispatch(fetchScreeningResults({ jobId: selectedJob }));
      dispatch(fetchCandidates({ jobId: selectedJob }));
      dispatch(fetchShortlist({ jobId: selectedJob }));
    }
  }, [dispatch, selectedJob]);

  const handleScreenAll = async () => {
    if (!selectedJob) return;
    toast.loading('AI screening in progress...', { id: 'screen' });
    try {
      const result = await dispatch(screenAllCandidates(selectedJob)).unwrap();
      toast.success(result.message, { id: 'screen' });
      dispatch(fetchScreeningResults({ jobId: selectedJob }));
      dispatch(fetchShortlist({ jobId: selectedJob }));
      dispatch(fetchCandidates({ jobId: selectedJob }));
    } catch (err: any) {
      toast.error(err || 'Screening failed', { id: 'screen' });
    }
  };

  const handleCompare = async () => {
    if (selectedCandidates.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    try {
      await dispatch(compareCandidates(selectedCandidates)).unwrap();
      toast.success('Comparison generated!');
    } catch (err: any) {
      toast.error(err || 'Comparison failed');
    }
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const newCandidatesCount = candidates.filter((c) => c.status === 'new').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Screening</h1>
          <p className="text-gray-500 mt-1">Screen candidates with AI-powered resume analysis</p>
        </div>
      </div>

      {/* Job Selector */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Select a Job to Screen</h2>
        <div className="flex gap-4">
          <select
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setSelectedCandidates([]);
            }}
            className="input-field flex-1"
          >
            <option value="">Choose a job...</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.company} ({job.totalCandidates} candidates)
              </option>
            ))}
          </select>
          <button
            onClick={handleScreenAll}
            disabled={!selectedJob || isScreening || newCandidatesCount === 0}
            className="btn-primary flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {isScreening ? 'Screening...' : `Screen ${newCandidatesCount} New`}
          </button>
        </div>
      </div>

      {!selectedJob ? (
        <EmptyState
          title="Select a job to begin"
          description="Choose a job posting above to view and run AI screening"
        />
      ) : isScreening ? (
        <ScreeningLoader />
      ) : (
        <>
          {/* Shortlist */}
          {shortlist.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI Shortlist</h2>
                <span className="text-sm text-gray-500">Top recommended candidates</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlist.map((screening) => {
                  const candidate = screening.candidate as any;
                  return (
                    <Link
                      key={screening._id}
                      href={`/dashboard/screening/${screening._id}`}
                      className="card p-5 hover:border-green-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <ScoreGauge score={screening.overallScore} size="sm" showLabel={false} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {candidate?.firstName} {candidate?.lastName}
                          </p>
                          <RecommendationBadge recommendation={screening.recommendation} />
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{screening.summary}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Screening Results */}
          {screenings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-semibold text-gray-900">All Screening Results</h2>
                  <span className="text-sm text-gray-500">({screenings.length} screened)</span>
                </div>
                {screenings.length >= 2 && (
                  <button
                    onClick={handleCompare}
                    disabled={selectedCandidates.length < 2 || loading}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    Compare Selected ({selectedCandidates.length})
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {screenings
                  .slice()
                  .sort((a, b) => b.overallScore - a.overallScore)
                  .map((screening, index) => {
                    const candidate = screening.candidate as any;
                    return (
                      <div
                        key={screening._id}
                        className={`card p-4 flex items-center gap-4 ${
                          selectedCandidates.includes(screening._id) ? 'border-primary-300 bg-primary-50/30' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(screening._id)}
                          onChange={() => toggleCandidate(screening._id)}
                          className="w-4 h-4 rounded text-primary-600"
                        />
                        <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                        <ScoreGauge score={screening.overallScore} size="sm" showLabel={false} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {candidate?.firstName} {candidate?.lastName}
                            </p>
                            <RecommendationBadge recommendation={screening.recommendation} />
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{screening.summary}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {(screening.processingTime / 1000).toFixed(1)}s
                          </span>
                          <Link
                            href={`/dashboard/screening/${screening._id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Comparison */}
          {comparison && (
            <div className="card p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Comparison</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {comparison.comparison}
              </div>
            </div>
          )}

          {screenings.length === 0 && (
            <EmptyState
              title="No screening results yet"
              description="Upload resumes and click 'Screen' to run AI-powered analysis"
            />
          )}
        </>
      )}
    </div>
  );
}
