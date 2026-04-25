import { Router } from 'express';
import { addCandidate, getCandidates, getCandidate, updateCandidateStatus, deleteCandidate, bulkUploadCandidates } from '../controllers/candidateController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', getCandidates);
router.get('/:id', getCandidate);
router.patch('/:id/status', updateCandidateStatus);
router.delete('/:id', deleteCandidate);

// Upload routes
router.post('/job/:jobId/upload', upload.single('resume'), addCandidate);
router.post('/job/:jobId/bulk-upload', upload.array('resumes', 20), bulkUploadCandidates);

export default router;
