import mongoose, { Schema, Document } from 'mongoose';
import { IJob } from '../types';

export interface IJobDocument extends Omit<IJob, '_id'>, Document {}

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [{
      type: String,
      trim: true,
    }],
    requirements: [{
      type: String,
      trim: true,
    }],
    preferredSkills: [{
      type: String,
      trim: true,
    }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'RWF' },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed'],
      default: 'active',
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalCandidates: {
      type: Number,
      default: 0,
    },
    screenedCandidates: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text' });

export const Job = mongoose.model<IJobDocument>('Job', jobSchema);
