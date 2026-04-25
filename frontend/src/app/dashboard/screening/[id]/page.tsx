'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchScreeningDetail } from '@/store/slices/screeningSlice';
import { PageLoader, EmptyState } from '@/components/LoadingStates';
import {
  ScoreGauge,
  RecommendationBadge,
  SkillBar,
  CategoryScoreCard,
} from '@/components/ScreeningResults';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function ScreeningDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentScreening, loading } = useAppSelector((state) => state.screening);

  useEffect(() => {
    if (id) dispatch(fetchScreeningDetail(id as string));
  }, [dispatch, id]);

  if (loading) return <PageLoader />;
  if (!currentScreening)
    return <EmptyState title="Screening not found" description="This screening result may have been deleted." />;

  const s = currentScreening;
  const candidate = s.candidate as any;
  const job = s.job as any;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {candidate?.firstName} {candidate?.lastName}
          </h1>
          <p className="text-gray-500">
            Screening for <strong>{job?.title}</strong> at {job?.company}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          {(s.processingTime / 1000).toFixed(1)}s analysis
        </div>
      </div>

      {/* Score Overview */}
      <div className="card p-8 mb-6 flex items-center gap-10">
        <ScoreGauge score={s.overallScore} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <RecommendationBadge recommendation={s.recommendation} />
            <span className="text-sm text-gray-500">
              AI Confidence: <strong className="text-gray-700">{s.aiConfidence}%</strong>
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{s.summary}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">Screening Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {s.categories.map((cat) => (
            <CategoryScoreCard
              key={cat.category}
              category={cat.category}
              score={cat.score}
              weight={cat.weight}
              details={cat.details}
            />
          ))}
        </div>
      </div>

      {/* Skill Assessments */}
      {s.skillAssessments.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Skill Assessments</h2>
          </div>
          <div className="space-y-3">
            {s.skillAssessments
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((skill) => (
                <SkillBar
                  key={skill.skill}
                  skill={skill.skill}
                  score={skill.score}
                  matchType={skill.matchType}
                />
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Strengths</h2>
          </div>
          <ul className="space-y-2">
            {s.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Weaknesses / Gaps</h2>
          </div>
          <ul className="space-y-2">
            {s.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interview Questions */}
      {s.interviewQuestions.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Suggested Interview Questions</h2>
          </div>
          <div className="space-y-3">
            {s.interviewQuestions.map((q, i) => (
              <div key={i} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-bold text-blue-400 mt-0.5">{i + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{q}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bias Flags */}
      {s.biasFlags.length > 0 && (
        <div className="card p-6 mb-6 border-yellow-200">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Bias Flags</h2>
            <span className="text-sm text-gray-500">Potential biases detected in the screening</span>
          </div>
          <div className="space-y-3">
            {s.biasFlags.map((flag, i) => (
              <div key={i} className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Culture Fit Notes */}
      {s.cultureFitNotes && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LightBulbIcon className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Culture Fit Notes</h2>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.cultureFitNotes}</p>
        </div>
      )}
    </div>
  );
}
