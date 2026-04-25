export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: 'recruiter' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'draft' | 'active' | 'paused' | 'closed';
  recruiter: string;
  totalCandidates: number;
  screenedCandidates: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  resumeText?: string;
  linkedIn?: string;
  portfolio?: string;
  skills: string[];
  experience: number;
  education: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  job: string | { _id: string; title: string; company: string };
  recruiter: string;
  status: 'new' | 'screening' | 'screened' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  createdAt: string;
  updatedAt: string;
}

export interface SkillAssessment {
  skill: string;
  score: number;
  evidence: string;
  matchType: 'exact' | 'related' | 'transferable' | 'missing';
}

export interface ScreeningCategory {
  category: string;
  score: number;
  weight: number;
  details: string;
}

export interface Screening {
  _id: string;
  candidate: string | Candidate;
  job: string | Job;
  recruiter: string;
  overallScore: number;
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
  summary: string;
  categories: ScreeningCategory[];
  skillAssessments: SkillAssessment[];
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  cultureFitNotes: string;
  interviewQuestions: string[];
  biasFlags: string[];
  aiModel: string;
  aiConfidence: number;
  processingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateComparison {
  comparison: string;
  candidates: Array<{
    id: string;
    name: string;
    score: number;
    recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
    strengths: string[];
    weaknesses: string[];
    skillGaps: string[];
  }>;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  screenedCandidates: number;
  shortlistedCandidates: number;
  averageScore: number;
  screeningsByDay: { date: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
  topSkills: { skill: string; count: number }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CandidatesState {
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ScreeningState {
  screenings: Screening[];
  currentScreening: Screening | null;
  shortlist: Screening[];
  comparison: CandidateComparison | null;
  loading: boolean;
  screening: boolean;
  error: string | null;
}
