import { Router } from 'express';
import {
  createApplication,
  getApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Submit a rental application (Renter)
router.post('/', authenticate, createApplication);

// Get applications (Renter: my sent applications | Owner: incoming applications)
router.get('/', authenticate, getApplications);

// Update application status (Owner: Approve or Reject)
router.patch('/:applicationId/status', authenticate, updateApplicationStatus);

export default router;