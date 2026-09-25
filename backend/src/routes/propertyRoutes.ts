import { Router } from 'express';
import {
  createProperty,
  getMyProperties,
  getAdminPendingProperties,
  updatePropertyStatusAdmin,
  getPublicProperties,
} from '../controllers/propertyController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// ─── 🌐 PUBLIC ROUTE ───
// Anyone can search and view approved properties without logging in
router.get('/', getPublicProperties);

// ─── 🏠 OWNER ROUTES (Must be logged in) ───
// Create a new property listing (DRAFT or PENDING_APPROVAL)
router.post('/', authenticate, createProperty);

// View owner's own properties
router.get('/owner/my-listings', authenticate, getMyProperties);

// ─── 🛡️ ADMIN ROUTES (Must be Administrator) ───
// View all listings waiting for admin approval
router.get('/admin/pending', authenticate, requireAdmin, getAdminPendingProperties);

// Approve or Reject a listing
router.patch('/admin/:id/status', authenticate, requireAdmin, updatePropertyStatusAdmin);

export default router;