import { Router } from 'express';
import { body } from 'express-validator';
import { createJob, getJobs, getJob, updateJob, deleteJob, getDashboardStats } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard/stats', getDashboardStats);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is needed'),
  ],
  createJob
);

router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
