import { Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// ADMIN: Get Marketplace Analytics Summary
export const getPlatformAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Total Users breakdown
    const [userRows] = await pool.query<RowDataPacket[]>(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    // 2. Owner Verification breakdown
    const [ownerRows] = await pool.query<RowDataPacket[]>(
      `SELECT verification_status, COUNT(*) as count FROM owner_profiles GROUP BY verification_status`
    );

    // 3. Property Status breakdown
    const [propRows] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count FROM properties GROUP BY status`
    );

    // 4. Transaction totals (Favourites, Viewings, Applications, Messages)
    const [favRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM favorites`);
    const [viewingRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM viewing_requests`);
    const [appRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM applications`);
    const [msgRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM messages`);

    res.status(200).json({
      analytics: {
        users: userRows,
        owners: ownerRows,
        properties: propRows,
        totals: {
          favorites: favRows[0].count,
          viewings: viewingRows[0].count,
          applications: appRows[0].count,
          messages: msgRows[0].count,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error fetching analytics.' });
  }
};