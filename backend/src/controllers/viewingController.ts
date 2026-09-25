import { Response } from 'express';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. RENTER: Request a Viewing
export const createViewingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId, preferredDate, preferredTime, message } = req.body;

    if (!propertyId || !preferredDate || !preferredTime) {
      res.status(400).json({ error: 'Property ID, preferred date, and time are required.' });
      return;
    }

    const viewingId = crypto.randomUUID();
    await pool.query<ResultSetHeader>(
      `INSERT INTO viewing_requests (id, user_id, property_id, preferred_date, preferred_time, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [viewingId, userId, propertyId, preferredDate, preferredTime, message || null]
    );

    res.status(201).json({ message: 'Viewing request sent to property owner successfully.', viewingId });
  } catch (error) {
    console.error('Error creating viewing request:', error);
    res.status(500).json({ error: 'Internal server error sending viewing request.' });
  }
};

// 2. OWNER / RENTER: Get Viewing Requests for User or Owner's Properties
export const getViewingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let query = '';
    let params: any[] = [];

    if (role === 'OWNER') {
      query = `
        SELECT v.*, p.title as property_title, u.full_name as renter_name, u.phone_number as renter_phone
        FROM viewing_requests v
        JOIN properties p ON v.property_id = p.id
        JOIN owner_profiles o ON p.owner_id = o.id
        JOIN users u ON v.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY v.preferred_date DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT v.*, p.title as property_title, l.suburb, l.city,
               (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
        FROM viewing_requests v
        JOIN properties p ON v.property_id = p.id
        LEFT JOIN property_locations l ON p.id = l.property_id
        WHERE v.user_id = ?
        ORDER BY v.preferred_date DESC
      `;
      params = [userId];
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.status(200).json({ viewingRequests: rows });
  } catch (error) {
    console.error('Error fetching viewing requests:', error);
    res.status(500).json({ error: 'Internal server error fetching viewing requests.' });
  }
};

// 3. OWNER: Update Viewing Status (Accept, Reject, Reschedule)
export const updateViewingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { viewingId } = req.params;
    const { status, counterDate, counterTime } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'RESCHEDULED', 'COMPLETED'].includes(status)) {
      res.status(400).json({ error: 'Invalid viewing status.' });
      return;
    }

    await pool.query(
      `UPDATE viewing_requests 
       SET status = ?, counter_date = ?, counter_time = ?
       WHERE id = ?`,
      [status, counterDate || null, counterTime || null, viewingId]
    );

    res.status(200).json({ message: `Viewing request status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating viewing status:', error);
    res.status(500).json({ error: 'Internal server error updating viewing status.' });
  }
};