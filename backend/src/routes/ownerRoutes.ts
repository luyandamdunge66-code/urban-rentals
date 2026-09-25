import { Router } from 'express';
import {
  getMyOwnerProfile,
  submitVerification,
  updatePrivacySettings,
  getPendingOwners,
  getOwnerDetailsAdmin,
  updateOwnerStatus,
  deleteOwnerAdmin,
  getAllUsersAdmin,
} from '../controllers/ownerController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// ─── OWNER ROUTES ───
router.get('/me', authenticate, getMyOwnerProfile);
router.put('/verification', authenticate, submitVerification);
router.patch('/privacy', authenticate, updatePrivacySettings);

// ─── ADMIN MANAGEMENT ROUTES ───
router.get('/admin/pending', authenticate, requireAdmin, getPendingOwners);

// View All Registered Users (Placed above :ownerProfileId)
router.get('/admin/users/all', authenticate, requireAdmin, getAllUsersAdmin);

// View Single Owner Profile
router.get('/admin/:ownerProfileId', authenticate, requireAdmin, getOwnerDetailsAdmin);

// Update Status (Approve, Reject, Suspend)
router.patch('/admin/:ownerProfileId/status', authenticate, requireAdmin, updateOwnerStatus);

// Permanently Delete Owner
router.delete('/admin/:ownerProfileId', authenticate, requireAdmin, deleteOwnerAdmin);

export default router;