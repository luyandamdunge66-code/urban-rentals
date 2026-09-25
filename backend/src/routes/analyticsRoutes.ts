import { Router } from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Get platform analytics summary (Admin only)
router.get('/admin', authenticate, requireAdmin, getPlatformAnalytics);

export default router;