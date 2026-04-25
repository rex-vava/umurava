import { Response } from 'express';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { Screening } from '../models/Screening';
import { AuthRequest } from '../types';
import { screenCandidate, generateCandidateComparison } from '../services/aiScreeningService';

export async function screenSingleCandidate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findOne({
      _id: candidateId,
      recruiter: req.user?._id,
    });

    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found.' });
      return;
    }

    const job = await Job.findById(candidate.job);
    if (!job) {
      res.status(404).json({ success: false, message: 'Associated job not found.' });
      return;
    }

    // Update candidate status to screening
    candidate.status = 'screening';
    await candidate.save();

    const startTime = Date.now();

    // Run AI screening
    const aiResult = await screenCandidate({
      resumeText: candidate.resumeText,
      jobTitle: job.title,
      jobDescription: job.description,
      requirements: job.requirements,
      preferredSkills: job.preferredSkills,
      responsibilities: job.responsibilities,
      experienceLevel: job.experienceLevel,
    });

    const processingTime = Date.now() - startTime;

    // Save screening results
    const screening = new Screening({
      candidate: candidate._id,
      job: job._id,
      recruiter: req.user?._id,
      overallScore: aiResult.overallScore,
      recommendation: aiResult.recommendation,
      summary: aiResult.summary,
      categories: aiResult.categories,
      skillAssessments: aiResult.skillAssessments,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      skillGaps: aiResult.skillGaps,
      cultureFitNotes: aiResult.cultureFitNotes,
      interviewQuestions: aiResult.interviewQuestions,
      biasFlags: aiResult.biasFlags,
      aiModel: 'gemini-1.5-flash',
      aiConfidence: aiResult.aiConfidence,
      processingTime,
    });

    await screening.save();

    // Update candidate status
    candidate.status = 'screened';
    await candidate.save();

    // Update job screened count
    await Job.findByIdAndUpdate(job._id, { $inc: { screenedCandidates: 1 } });

    res.json({
      success: true,
      message: 'Screening completed successfully.',
      data: { screening },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function screenAllCandidates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, recruiter: req.user?._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    const candidates = await Candidate.find({
      job: jobId,
      status: 'new',
      recruiter: req.user?._id,
    });

    if (candidates.length === 0) {
      res.status(400).json({ success: false, message: 'No unscreened candidates found.' });
      return;
    }

    // Process candidates sequentially to avoid API rate limits
    const results = [];
    const errors = [];

    for (const candidate of candidates) {
      try {
        candidate.status = 'screening';
        await candidate.save();

        const startTime = Date.now();

        const aiResult = await screenCandidate({
          resumeText: candidate.resumeText,
          jobTitle: job.title,
          jobDescription: job.description,
          requirements: job.requirements,
          preferredSkills: job.preferredSkills,
          responsibilities: job.responsibilities,
          experienceLevel: job.experienceLevel,
        });

        const processingTime = Date.now() - startTime;

        const screening = new Screening({
          candidate: candidate._id,
          job: job._id,
          recruiter: req.user?._id,
          overallScore: aiResult.overallScore,
          recommendation: aiResult.recommendation,
          summary: aiResult.summary,
          categories: aiResult.categories,
          skillAssessments: aiResult.skillAssessments,
          strengths: aiResult.strengths,
          weaknesses: aiResult.weaknesses,
          skillGaps: aiResult.skillGaps,
          cultureFitNotes: aiResult.cultureFitNotes,
          interviewQuestions: aiResult.interviewQuestions,
          biasFlags: aiResult.biasFlags,
          aiModel: 'gemini-1.5-flash',
          aiConfidence: aiResult.aiConfidence,
          processingTime,
        });

        await screening.save();

        candidate.status = 'screened';
        await candidate.save();

        results.push({
          candidateId: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          score: aiResult.overallScore,
          recommendation: aiResult.recommendation,
        });
      } catch (err: any) {
        candidate.status = 'new';
        await candidate.save();
        errors.push({
          candidateId: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          error: err.message,
        });
      }
    }

    // Update job screened count
    await Job.findByIdAndUpdate(jobId, { $inc: { screenedCandidates: results.length } });

    res.json({
      success: true,
      message: `Screened ${results.length} candidates. ${errors.length} failed.`,
      data: { results, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getScreeningResults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const sortBy = (req.query.sortBy as string) || 'overallScore';
    const order = req.query.order === 'asc' ? 1 : -1;

    const screenings = await Screening.find({
      job: jobId,
      recruiter: req.user?._id,
    })
      .populate('candidate', 'firstName lastName email skills currentRole status')
      .sort({ [sortBy]: order });

    res.json({
      success: true,
      data: { screenings },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getScreeningDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const screening = await Screening.findOne({
      _id: req.params.id,
      recruiter: req.user?._id,
    })
      .populate('candidate')
      .populate('job', 'title company requirements preferredSkills');

    if (!screening) {
      res.status(404).json({ success: false, message: 'Screening not found.' });
      return;
    }

    res.json({
      success: true,
      data: { screening },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getShortlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const minScore = parseInt(req.query.minScore as string) || 70;
    const limit = parseInt(req.query.limit as string) || 10;

    const screenings = await Screening.find({
      job: jobId,
      recruiter: req.user?._id,
      overallScore: { $gte: minScore },
      recommendation: { $in: ['strong-yes', 'yes'] },
    })
      .populate('candidate', 'firstName lastName email skills currentRole currentCompany experience')
      .sort({ overallScore: -1 })
      .limit(limit);

    // Auto-shortlist top candidates
    for (const screening of screenings) {
      if (screening.candidate) {
        await Candidate.findByIdAndUpdate(
          (screening.candidate as any)._id,
          { status: 'shortlisted' }
        );
      }
    }

    res.json({
      success: true,
      data: {
        shortlist: screenings,
        total: screenings.length,
        criteria: { minScore, recommendations: ['strong-yes', 'yes'] },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function compareCandidates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { candidateIds } = req.body;

    if (!candidateIds || candidateIds.length < 2) {
      res.status(400).json({ success: false, message: 'At least 2 candidate IDs required.' });
      return;
    }

    const screenings = await Screening.find({
      candidate: { $in: candidateIds },
      recruiter: req.user?._id,
    }).populate('candidate', 'firstName lastName');

    if (screenings.length < 2) {
      res.status(400).json({ success: false, message: 'Not enough screened candidates to compare.' });
      return;
    }

    const candidateData = screenings.map((s) => ({
      name: `${(s.candidate as any).firstName} ${(s.candidate as any).lastName}`,
      score: s.overallScore,
      strengths: s.strengths,
      weaknesses: s.weaknesses,
    }));

    const job = await Job.findById(screenings[0].job);
    const comparison = await generateCandidateComparison(
      candidateData,
      job?.title || 'Unknown Position'
    );

    res.json({
      success: true,
      data: {
        comparison,
        candidates: screenings.map((s) => ({
          id: (s.candidate as any)._id,
          name: `${(s.candidate as any).firstName} ${(s.candidate as any).lastName}`,
          score: s.overallScore,
          recommendation: s.recommendation,
          strengths: s.strengths,
          weaknesses: s.weaknesses,
          skillGaps: s.skillGaps,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
