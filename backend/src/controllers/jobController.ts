import { Response } from 'express';
import { Job } from '../models/Job';
import { Candidate } from '../models/Candidate';
import { Screening } from '../models/Screening';
import { AuthRequest } from '../types';

export async function createJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const job = new Job({
      ...req.body,
      recruiter: req.user?._id,
      company: req.body.company || req.user?.company,
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully.',
      data: { job },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getJobs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const filter: any = { recruiter: req.user?._id };
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { jobs },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user?._id,
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    // Get candidate stats for this job
    const [totalCandidates, screenedCandidates, shortlistedCandidates] = await Promise.all([
      Candidate.countDocuments({ job: job._id }),
      Candidate.countDocuments({ job: job._id, status: { $in: ['screened', 'shortlisted', 'interview', 'hired'] } }),
      Candidate.countDocuments({ job: job._id, status: 'shortlisted' }),
    ]);

    res.json({
      success: true,
      data: {
        job,
        stats: { totalCandidates, screenedCandidates, shortlistedCandidates },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Job updated successfully.',
      data: { job },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user?._id,
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    // Clean up related candidates and screenings
    await Promise.all([
      Candidate.deleteMany({ job: job._id }),
      Screening.deleteMany({ job: job._id }),
    ]);

    res.json({
      success: true,
      message: 'Job and related data deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const recruiterId = req.user?._id;

    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      screenedCandidates,
      shortlistedCandidates,
      recentScreenings,
      scoreAggregation,
    ] = await Promise.all([
      Job.countDocuments({ recruiter: recruiterId }),
      Job.countDocuments({ recruiter: recruiterId, status: 'active' }),
      Candidate.countDocuments({ recruiter: recruiterId }),
      Candidate.countDocuments({ recruiter: recruiterId, status: { $in: ['screened', 'shortlisted', 'interview', 'hired'] } }),
      Candidate.countDocuments({ recruiter: recruiterId, status: 'shortlisted' }),
      Screening.find({ recruiter: recruiterId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select('createdAt overallScore'),
      Screening.aggregate([
        { $match: { recruiter: recruiterId } },
        { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
      ]),
    ]);

    // Calculate screenings by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const screeningsByDay = await Screening.aggregate([
      {
        $match: {
          recruiter: recruiterId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Score distribution
    const scoreDistribution = await Screening.aggregate([
      { $match: { recruiter: recruiterId } },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 20, 40, 60, 80, 101],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Top skills from candidates
    const topSkills = await Candidate.aggregate([
      { $match: { recruiter: recruiterId } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const averageScore = scoreAggregation[0]?.avgScore || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalCandidates,
          screenedCandidates,
          shortlistedCandidates,
          averageScore: Math.round(averageScore),
          screeningsByDay: screeningsByDay.map((s: any) => ({
            date: s._id,
            count: s.count,
          })),
          scoreDistribution: scoreDistribution.map((s: any) => ({
            range: `${s._id}-${s._id + 19}`,
            count: s.count,
          })),
          topSkills: topSkills.map((s: any) => ({
            skill: s._id,
            count: s.count,
          })),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
