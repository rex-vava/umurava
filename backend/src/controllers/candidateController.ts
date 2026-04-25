import { Response } from 'express';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { Screening } from '../models/Screening';
import { AuthRequest } from '../types';
import { parseResume, extractBasicInfo } from '../services/resumeParser';

export async function addCandidate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, recruiter: req.user?._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Resume file is required.' });
      return;
    }

    // Parse the resume
    const resumeText = await parseResume(req.file.path);
    const basicInfo = extractBasicInfo(resumeText);

    const candidate = new Candidate({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email || basicInfo.email || '',
      phone: req.body.phone || basicInfo.phone,
      resumeUrl: req.file.path,
      resumeText,
      linkedIn: req.body.linkedIn,
      portfolio: req.body.portfolio,
      skills: basicInfo.skills,
      experience: parseInt(req.body.experience) || 0,
      education: req.body.education || '',
      currentRole: req.body.currentRole,
      currentCompany: req.body.currentCompany,
      location: req.body.location,
      job: jobId,
      recruiter: req.user?._id,
    });

    await candidate.save();

    // Update job candidate count
    await Job.findByIdAndUpdate(jobId, { $inc: { totalCandidates: 1 } });

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully.',
      data: { candidate },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getCandidates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const jobId = req.query.jobId as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const filter: any = { recruiter: req.user?._id };
    if (status && status !== 'all') filter.status = status;
    if (jobId) filter.job = jobId;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .populate('job', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-resumeText'),
      Candidate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { candidates },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCandidate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      recruiter: req.user?._id,
    }).populate('job', 'title company');

    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found.' });
      return;
    }

    // Get screening results if available
    const screening = await Screening.findOne({ candidate: candidate._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { candidate, screening },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCandidateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'screening', 'screened', 'shortlisted', 'interview', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user?._id },
      { status },
      { new: true }
    );

    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Candidate status updated.',
      data: { candidate },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteCandidate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const candidate = await Candidate.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user?._id,
    });

    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found.' });
      return;
    }

    // Clean up screenings
    await Screening.deleteMany({ candidate: candidate._id });

    // Update job count
    await Job.findByIdAndUpdate(candidate.job, { $inc: { totalCandidates: -1 } });

    res.json({
      success: true,
      message: 'Candidate deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function bulkUploadCandidates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, recruiter: req.user?._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'At least one resume file is required.' });
      return;
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const resumeText = await parseResume(file.path);
        const basicInfo = extractBasicInfo(resumeText);

        const candidate = new Candidate({
          firstName: basicInfo.email?.split('@')[0] || 'Unknown',
          lastName: '',
          email: basicInfo.email || `candidate-${Date.now()}@unknown.com`,
          phone: basicInfo.phone,
          resumeUrl: file.path,
          resumeText,
          skills: basicInfo.skills,
          job: jobId,
          recruiter: req.user?._id,
        });

        await candidate.save();
        results.push({ filename: file.originalname, status: 'success', candidateId: candidate._id });
      } catch (err: any) {
        errors.push({ filename: file.originalname, status: 'failed', error: err.message });
      }
    }

    // Update job count
    await Job.findByIdAndUpdate(jobId, { $inc: { totalCandidates: results.length } });

    res.status(201).json({
      success: true,
      message: `${results.length} candidates uploaded, ${errors.length} failed.`,
      data: { results, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
