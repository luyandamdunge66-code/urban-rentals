import { Router } from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from '../controllers/messageController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Start or get existing conversation for a property
router.post('/conversation', authenticate, getOrCreateConversation);

// Get all conversations for logged-in user
router.get('/conversations', authenticate, getMyConversations);

// Get messages for a specific conversation
router.get('/:conversationId/messages', authenticate, getMessages);

// Send a message
router.post('/messages', authenticate, sendMessage);

export default router;