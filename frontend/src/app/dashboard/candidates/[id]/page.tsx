'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { candidatesAPI } from '@/services/api';
import { Candidate, Screening } from '@/types';
import { PageLoader, EmptyState } from '@/components/LoadingStates';
import { ScoreGauge, RecommendationBadge } from '@/components/ScreeningResults';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [screening, setScreening] = useState<Screening | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await candidatesAPI.getOne(id as string);
        setCandidate(res.data.data.candidate);
        setScreening(res.data.data.screening || null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      load();
    }
  }, [id]);

  if (loading) return <PageLoader />;
  if (!candidate) return <EmptyState title="Candidate not found" description="The candidate may have been removed." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h1>
          <p className="text-gray-500">{candidate.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="text-gray-500">Phone:</span> {candidate.phone || 'N/A'}</p>
            <p><span className="text-gray-500">Experience:</span> {candidate.experience || 0} years</p>
            <p><span className="text-gray-500">Education:</span> {candidate.education || 'N/A'}</p>
            <p><span className="text-gray-500">Current Role:</span> {candidate.currentRole || 'N/A'}</p>
            <p><span className="text-gray-500">Current Company:</span> {candidate.currentCompany || 'N/A'}</p>
            <p><span className="text-gray-500">Location:</span> {candidate.location || 'N/A'}</p>
            <p><span className="text-gray-500">Status:</span> <span className="badge badge-blue">{candidate.status}</span></p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
          {candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No extracted skills yet.</p>
          )}
        </div>
      </div>

      {screening ? (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest AI Screening</h2>
          <div className="flex items-center gap-4 mb-4">
            <ScoreGauge score={screening.overallScore} size="md" />
            <div>
              <RecommendationBadge recommendation={screening.recommendation} />
              <p className="text-sm text-gray-600 mt-2">{screening.summary}</p>
            </div>
          </div>
          <Link href={`/dashboard/screening/${screening._id}`} className="btn-primary inline-block">
            Open Full Screening Report
          </Link>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Screening</h2>
          <p className="text-sm text-gray-500">This candidate has not been screened yet.</p>
        </div>
      )}
    </div>
  );
}
