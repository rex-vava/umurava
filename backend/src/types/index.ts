import { Request } from 'express';
import { Types } from 'mongoose';

// ============ User Types ============
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
  role: 'recruiter' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ============ Job Types ============
export interface IJob {
  _id: Types.ObjectId;
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
  recruiter: Types.ObjectId;
  totalCandidates: number;
  screenedCandidates: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Candidate Types ============
export interface ICandidate {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  resumeText: string;
  linkedIn?: string;
  portfolio?: string;
  skills: string[];
  experience: number;
  education: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  job: Types.ObjectId;
  recruiter: Types.ObjectId;
  status: 'new' | 'screening' | 'screened' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  createdAt: Date;
  updatedAt: Date;
}

// ============ Screening Types ============
export interface ISkillAssessment {
  skill: string;
  score: number; // 0-100
  evidence: string;
  matchType: 'exact' | 'related' | 'transferable' | 'missing';
}

export interface IScreeningCategory {
  category: string;
  score: number; // 0-100
  weight: number;
  details: string;
}

export interface IScreening {
  _id: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  recruiter: Types.ObjectId;
  overallScore: number; // 0-100
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
  summary: string;
  categories: IScreeningCategory[];
  skillAssessments: ISkillAssessment[];
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  cultureFitNotes: string;
  interviewQuestions: string[];
  biasFlags: string[];
  aiModel: string;
  aiConfidence: number;
  processingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ API Response Types ============
export interface ApiResponse<T = unknown> {
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

// ============ Dashboard Types ============
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
