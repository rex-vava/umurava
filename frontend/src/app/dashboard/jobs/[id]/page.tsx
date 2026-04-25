'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJob } from '@/store/slices/jobsSlice';
import { fetchCandidates } from '@/store/slices/candidatesSlice';
import { screenAllCandidates, fetchScreeningResults } from '@/store/slices/screeningSlice';
import { PageLoader, EmptyState, ScreeningLoader } from '@/components/LoadingStates';
import { ScoreGauge, RecommendationBadge } from '@/components/ScreeningResults';
import { candidatesAPI } from '@/services/api';
import {
  ArrowLeftIcon,
  UserPlusIcon,
  SparklesIcon,
  DocumentArrowUpIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentJob, loading: jobLoading } = useAppSelector((state) => state.jobs);
  const { candidates } = useAppSelector((state) => state.candidates);
  const { screenings, screening: isScreening } = useAppSelector((state) => state.screening);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'results'>('candidates');

  useEffect(() => {
    if (id) {
      dispatch(fetchJob(id as string));
      dispatch(fetchCandidates({ jobId: id as string }));
      dispatch(fetchScreeningResults({ jobId: id as string }));
    }
  }, [dispatch, id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const formData = new FormData();
        formData.append('resume', files[i]);
        formData.append('firstName', files[i].name.replace(/\.[^/.]+$/, '').split(/[-_]/)[0] || 'Candidate');
        formData.append('lastName', files[i].name.replace(/\.[^/.]+$/, '').split(/[-_]/)[1] || `${i + 1}`);

        await candidatesAPI.upload(id as string, formData);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} candidate(s) uploaded successfully`);
      dispatch(fetchCandidates({ jobId: id as string }));
      dispatch(fetchJob(id as string));
    }
    if (failCount > 0) {
      toast.error(`${failCount} upload(s) failed`);
    }

    e.target.value = '';
  };

  const handleScreenAll = async () => {
    if (!id) return;
    toast.loading('Starting AI screening...', { id: 'screening' });
    try {
      const result = await dispatch(screenAllCandidates(id as string)).unwrap();
      toast.success(result.message, { id: 'screening' });
      dispatch(fetchCandidates({ jobId: id as string }));
      dispatch(fetchScreeningResults({ jobId: id as string }));
      dispatch(fetchJob(id as string));
      setActiveTab('results');
    } catch (err: any) {
      toast.error(err || 'Screening failed', { id: 'screening' });
    }
  };

  if (jobLoading) return <PageLoader />;
  if (!currentJob) return <EmptyState title="Job not found" description="This job may have been deleted." />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{currentJob.title}</h1>
          <p className="text-gray-500">{currentJob.company} • {currentJob.location} • {currentJob.type}</p>
        </div>
        <span className={`badge ${currentJob.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
          {currentJob.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <UserGroupIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{currentJob.totalCandidates}</p>
          <p className="text-xs text-gray-500">Total Candidates</p>
        </div>
        <div className="card p-4 text-center">
          <SparklesIcon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{currentJob.screenedCandidates}</p>
          <p className="text-xs text-gray-500">Screened</p>
        </div>
        <div className="card p-4 text-center">
          <CheckBadgeIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {screenings.filter((s) => s.recommendation === 'strong-yes' || s.recommendation === 'yes').length}
          </p>
          <p className="text-xs text-gray-500">Recommended</p>
        </div>
        <div className="card p-4 text-center">
          <ChartBarIcon className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {screenings.length > 0
              ? Math.round(screenings.reduce((a, s) => a + s.overallScore, 0) / screenings.length)
              : 0}
          </p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <DocumentArrowUpIcon className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Resumes'}
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <button
          onClick={handleScreenAll}
          disabled={isScreening || candidates.filter((c) => c.status === 'new').length === 0}
          className="btn-success flex items-center gap-2"
        >
          <SparklesIcon className="w-5 h-5" />
          {isScreening ? 'Screening...' : 'Screen All New Candidates'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'candidates'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Candidates ({candidates.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'results'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Screening Results ({screenings.length})
        </button>
      </div>

      {/* Tab Content */}
      {isScreening ? (
        <ScreeningLoader />
      ) : activeTab === 'candidates' ? (
        candidates.length === 0 ? (
          <EmptyState
            title="No candidates yet"
            description="Upload resumes to add candidates for this job"
          />
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {candidate.skills.length > 0 && (
                    <div className="hidden md:flex gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className={`badge ${
                    candidate.status === 'screened' ? 'badge-green' :
                    candidate.status === 'shortlisted' ? 'badge-blue' :
                    candidate.status === 'screening' ? 'badge-yellow' :
                    candidate.status === 'rejected' ? 'badge-red' : 'badge-gray'
                  }`}>
                    {candidate.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        screenings.length === 0 ? (
          <EmptyState
            title="No screening results"
            description="Screen candidates to see AI-powered analysis results"
          />
        ) : (
          <div className="space-y-4">
            {screenings.map((screening) => {
              const candidate = screening.candidate as any;
              return (
                <Link
                  key={screening._id}
                  href={`/dashboard/screening/${screening._id}`}
                  className="card p-6 flex items-center gap-6 hover:border-primary-200 transition-colors block"
                >
                  <ScoreGauge score={screening.overallScore} size="sm" showLabel={false} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {candidate?.firstName} {candidate?.lastName}
                      </p>
                      <RecommendationBadge recommendation={screening.recommendation} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{screening.summary}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Confidence: {screening.aiConfidence}%</p>
                    <p>{(screening.processingTime / 1000).toFixed(1)}s</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
