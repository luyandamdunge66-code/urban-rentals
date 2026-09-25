import { Response } from 'express';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. START OR GET CONVERSATION (Between renter and owner for a property)
export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const renterId = req.user?.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required.' });
      return;
    }

    // Find the owner of this property
    const [propRows] = await pool.query<RowDataPacket[]>(
      `SELECT o.user_id as owner_user_id 
       FROM properties p 
       JOIN owner_profiles o ON p.owner_id = o.id 
       WHERE p.id = ?`,
      [propertyId]
    );

    if (propRows.length === 0) {
      res.status(404).json({ error: 'Property not found.' });
      return;
    }

    const ownerId = propRows[0].owner_user_id;

    if (renterId === ownerId) {
      res.status(400).json({ error: 'You cannot message yourself about your own property.' });
      return;
    }

    // Check if conversation already exists
    const [convRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM conversations WHERE property_id = ? AND renter_id = ? AND owner_id = ?`,
      [propertyId, renterId, ownerId]
    );

    let conversationId = '';

    if (convRows.length > 0) {
      conversationId = convRows[0].id;
    } else {
      conversationId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO conversations (id, property_id, renter_id, owner_id) VALUES (?, ?, ?, ?)`,
        [conversationId, propertyId, renterId, ownerId]
      );
    }

    res.status(200).json({ conversationId });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Internal server error starting conversation.' });
  }
};

// 2. GET ALL CONVERSATIONS FOR LOGGED-IN USER (As Renter or Owner)
export const getMyConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, p.title as property_title,
              r.full_name as renter_name, o_user.full_name as owner_name,
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN properties p ON c.property_id = p.id
       JOIN users r ON c.renter_id = r.id
       JOIN users o_user ON c.owner_id = o_user.id
       WHERE c.renter_id = ? OR c.owner_id = ?
       ORDER BY last_message_time DESC`,
      [userId, userId]
    );

    res.status(200).json({ conversations: rows });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error fetching conversations.' });
  }
};

// 3. GET MESSAGES IN A CONVERSATION
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    res.status(200).json({ messages: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error fetching messages.' });
  }
};

// 4. SEND A MESSAGE
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { conversationId, content } = req.body;

    if (!conversationId || !content || !content.trim()) {
      res.status(400).json({ error: 'Conversation ID and message content are required.' });
      return;
    }

    const messageId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)`,
      [messageId, conversationId, senderId, content.trim()]
    );

    res.status(201).json({ message: 'Message sent successfully.', messageId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error sending message.' });
  }
};