'use client';

import { Screening } from '@/types';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 80) return { text: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-200' };
    if (s >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', ring: 'ring-blue-200' };
    if (s >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-500', ring: 'ring-yellow-200' };
    return { text: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200' };
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Below Average';
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-28 h-28 text-3xl',
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} rounded-full ring-4 ${colors.ring} flex items-center justify-center font-bold ${colors.text}`}>
        {score}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colors.text}`}>{getLabel(score)}</span>
      )}
    </div>
  );
}

interface RecommendationBadgeProps {
  recommendation: Screening['recommendation'];
}

export function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const config = {
    'strong-yes': { label: 'Strong Yes', className: 'bg-green-100 text-green-800 border-green-200' },
    'yes': { label: 'Yes', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'maybe': { label: 'Maybe', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'no': { label: 'No', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    'strong-no': { label: 'Strong No', className: 'bg-red-100 text-red-800 border-red-200' },
  };

  const { label, className } = config[recommendation] || config['maybe'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${className}`}>
      {label}
    </span>
  );
}

interface SkillBarProps {
  skill: string;
  score: number;
  matchType: string;
}

export function SkillBar({ skill, score, matchType }: SkillBarProps) {
  const getBarColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-blue-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const matchColors = {
    exact: 'text-green-600 bg-green-50',
    related: 'text-blue-600 bg-blue-50',
    transferable: 'text-purple-600 bg-purple-50',
    missing: 'text-red-600 bg-red-50',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{skill}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${matchColors[matchType as keyof typeof matchColors] || matchColors.missing}`}>
            {matchType}
          </span>
          <span className="text-sm font-semibold text-gray-900">{score}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface CategoryScoreCardProps {
  category: string;
  score: number;
  weight: number;
  details: string;
}

export function CategoryScoreCard({ category, score, weight, details }: CategoryScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 80) return 'border-l-green-500';
    if (s >= 60) return 'border-l-blue-500';
    if (s >= 40) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${getColor(score)} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{category}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Weight: {weight}%</span>
          <span className="text-lg font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">{details}</p>
    </div>
  );
}
