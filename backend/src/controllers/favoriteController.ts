import { Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. TOGGLE FAVOURITE (Add or Remove property from saved list)
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required.' });
      return;
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [
        userId,
        propertyId,
      ]);
      res.status(200).json({ favorited: false, message: 'Property removed from favourites.' });
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
        [userId, propertyId]
      );
      res.status(200).json({ favorited: true, message: 'Property saved to favourites!' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Internal server error updating favourites.' });
  }
};

// 2. GET USER'S FAVOURITES LIST (Includes owner phone, email, and full details)
export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.title, p.description, p.property_type, p.price_cents, p.bedrooms, p.bathrooms,
              p.parking_bays, p.available_from, p.created_at,
              l.suburb, l.city, l.street_address,
              o.full_legal_name AS owner_name,
              u.email AS owner_email, u.phone_number AS owner_phone,
              (SELECT GROUP_CONCAT(image_url SEPARATOR '||') FROM property_images WHERE property_id = p.id ORDER BY display_order ASC) as all_images,
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       JOIN owner_profiles o ON p.owner_id = o.id
       JOIN users u ON o.user_id = u.id
       LEFT JOIN property_locations l ON p.id = l.property_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.status(200).json({ favorites: rows });
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Internal server error fetching favourites.' });
  }
};