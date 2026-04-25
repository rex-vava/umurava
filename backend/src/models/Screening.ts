import mongoose, { Schema, Document } from 'mongoose';
import { IScreening } from '../types';

export interface IScreeningDocument extends Omit<IScreening, '_id'>, Document {}

const screeningSchema = new Schema<IScreeningDocument>(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
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
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    recommendation: {
      type: String,
      enum: ['strong-yes', 'yes', 'maybe', 'no', 'strong-no'],
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    categories: [{
      category: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 },
      weight: { type: Number, required: true },
      details: { type: String, required: true },
    }],
    skillAssessments: [{
      skill: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 },
      evidence: { type: String, required: true },
      matchType: {
        type: String,
        enum: ['exact', 'related', 'transferable', 'missing'],
        required: true,
      },
    }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    skillGaps: [{ type: String }],
    cultureFitNotes: {
      type: String,
      default: '',
    },
    interviewQuestions: [{ type: String }],
    biasFlags: [{ type: String }],
    aiModel: {
      type: String,
      required: true,
    },
    aiConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    processingTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

screeningSchema.index({ candidate: 1 });
screeningSchema.index({ job: 1, overallScore: -1 });
screeningSchema.index({ recruiter: 1 });

export const Screening = mongoose.model<IScreeningDocument>('Screening', screeningSchema);
