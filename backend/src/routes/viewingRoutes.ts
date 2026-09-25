import { Router } from 'express';
import {
  createViewingRequest,
  getViewingRequests,
  updateViewingStatus,
} from '../controllers/viewingController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Send viewing request (Renter)
router.post('/', authenticate, createViewingRequest);

// Get viewing requests (Renter or Owner)
router.get('/', authenticate, getViewingRequests);

// Update viewing status (Owner: Accept, Decline, Reschedule)
router.patch('/:viewingId/status', authenticate, updateViewingStatus);

export default router;