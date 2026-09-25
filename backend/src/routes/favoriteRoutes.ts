import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Toggle save/favorite (Requires logged-in renter/user)
router.post('/toggle', authenticate, toggleFavorite);

// Get all saved favorites for logged-in user
router.get('/my-favorites', authenticate, getMyFavorites);

export default router;