import { Router } from 'express';
import {
  screenSingleCandidate,
  screenAllCandidates,
  getScreeningResults,
  getScreeningDetail,
  getShortlist,
  compareCandidates,
} from '../controllers/screeningController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Screen candidates
router.post('/candidate/:candidateId', screenSingleCandidate);
router.post('/job/:jobId/all', screenAllCandidates);

// Get results
router.get('/job/:jobId', getScreeningResults);
router.get('/job/:jobId/shortlist', getShortlist);
router.get('/:id', getScreeningDetail);

// Compare candidates
router.post('/compare', compareCandidates);

export default router;
