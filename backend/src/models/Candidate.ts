import mongoose, { Schema, Document } from 'mongoose';
import { ICandidate } from '../types';

export interface ICandidateDocument extends Omit<ICandidate, '_id'>, Document {}

const candidateSchema = new Schema<ICandidateDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: Number,
      default: 0,
    },
    education: {
      type: String,
      default: '',
    },
    currentRole: {
      type: String,
      trim: true,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'screening', 'screened', 'shortlisted', 'interview', 'rejected', 'hired'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index({ job: 1, status: 1 });
candidateSchema.index({ recruiter: 1 });
candidateSchema.index({ email: 1, job: 1 });

export const Candidate = mongoose.model<ICandidateDocument>('Candidate', candidateSchema);
