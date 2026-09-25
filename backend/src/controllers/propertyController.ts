import { Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper: Saves base64 images from computer/phone gallery to disk as real .jpg files
const saveImageToDisk = (imageString: string): string => {
  if (imageString.startsWith('http://') || imageString.startsWith('https://')) {
    return imageString;
  }

  const matches = imageString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return imageString;
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const filename = `prop_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/${filename}`;
};

// 1. OWNER: Create Property
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [ownerRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, verification_status FROM owner_profiles WHERE user_id = ?',
      [userId]
    );

    if (ownerRows.length === 0 || ownerRows[0].verification_status !== 'APPROVED') {
      res.status(403).json({ error: 'Only approved property owners can create listings.' });
      return;
    }

    const owner = ownerRows[0];
    const {
      title,
      description,
      propertyType,
      rentalPeriod,
      priceZar,
      depositZar,
      bedrooms,
      bathrooms,
      parkingBays,
      isFurnished,
      sizeSqm,
      availableFrom,
      streetAddress,
      suburb,
      city,
      postalCode,
      amenities,
      images,
      status,
    } = req.body;

    if (!title || !description || !propertyType || !priceZar || !availableFrom || !streetAddress || !suburb || !city || !postalCode) {
      res.status(400).json({ error: 'Please provide all compulsory property details and address.' });
      return;
    }

    const propertyId = crypto.randomUUID();
    const priceCents = Math.round(Number(priceZar) * 100);
    const depositCents = depositZar ? Math.round(Number(depositZar) * 100) : null;
    const initialStatus = status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'DRAFT';

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query<ResultSetHeader>(
        `INSERT INTO properties (
          id, owner_id, title, description, property_type, rental_period,
          price_cents, deposit_cents, bedrooms, bathrooms, parking_bays,
          is_furnished, size_sqm, available_from, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyId,
          owner.id,
          title.trim(),
          description.trim(),
          propertyType,
          rentalPeriod || 'MONTHLY',
          priceCents,
          depositCents,
          Number(bedrooms) || 0,
          Number(bathrooms) || 0,
          Number(parkingBays) || 0,
          Boolean(isFurnished),
          sizeSqm ? Number(sizeSqm) : null,
          availableFrom,
          initialStatus,
        ]
      );

      const locationId = crypto.randomUUID();
      await connection.query<ResultSetHeader>(
        `INSERT INTO property_locations (
          id, property_id, street_address, suburb, city, postal_code
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [locationId, propertyId, streetAddress.trim(), suburb.trim(), city.trim(), postalCode.trim()]
      );

      if (Array.isArray(amenities) && amenities.length > 0) {
        for (const amenity of amenities) {
          await connection.query(
            `INSERT INTO property_amenities (property_id, amenity_name) VALUES (?, ?)`,
            [propertyId, amenity]
          );
        }
      }

      const rawPhotos = Array.isArray(images) && images.length > 0
        ? images.slice(0, 10)
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];

      for (let i = 0; i < rawPhotos.length; i++) {
        const savedUrl = saveImageToDisk(rawPhotos[i]);
        const imageId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO property_images (id, property_id, image_url, display_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [imageId, propertyId, savedUrl, i, i === 0]
        );
      }

      await connection.commit();

      res.status(201).json({
        message:
          initialStatus === 'PENDING_APPROVAL'
            ? 'Property submitted for administrator review!'
            : 'Property saved as draft.',
        propertyId,
        status: initialStatus,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Internal server error creating property.' });
  }
};

// 2. OWNER: Get My Properties
export const getMyProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, l.street_address, l.suburb, l.city, l.postal_code,
              (SELECT GROUP_CONCAT(image_url SEPARATOR '||') FROM property_images WHERE property_id = p.id ORDER BY display_order ASC) as all_images,
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM properties p
       JOIN owner_profiles o ON p.owner_id = o.id
       LEFT JOIN property_locations l ON p.id = l.property_id
       WHERE o.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json({ properties: rows });
  } catch (error) {
    console.error('Error fetching owner properties:', error);
    res.status(500).json({ error: 'Internal server error fetching properties.' });
  }
};

// 3. ADMIN: Get ALL Properties for Review & Management (NO WHERE CLAUSE!)
export const getAdminPendingProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, l.street_address, l.suburb, l.city, l.postal_code,
              o.full_legal_name AS owner_name, u.email AS owner_email, u.phone_number AS owner_phone,
              (SELECT GROUP_CONCAT(image_url SEPARATOR '||') FROM property_images WHERE property_id = p.id ORDER BY display_order ASC) as all_images,
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM properties p
       JOIN owner_profiles o ON p.owner_id = o.id
       JOIN users u ON o.user_id = u.id
       LEFT JOIN property_locations l ON p.id = l.property_id
       ORDER BY p.created_at DESC`
    );

    res.status(200).json({ pendingProperties: rows });
  } catch (error) {
    console.error('Error fetching properties for admin:', error);
    res.status(500).json({ error: 'Internal server error fetching properties.' });
  }
};

// 4. ADMIN: Approve or Reject a Listing
export const updatePropertyStatusAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }

    await pool.query(
      `UPDATE properties 
       SET status = ?,
           admin_review_notes = ?,
           approved_by = ?,
           approved_at = ?
       WHERE id = ?`,
      [status, reviewNotes || null, status === 'APPROVED' ? adminId : null, status === 'APPROVED' ? new Date() : null, id]
    );

    res.status(200).json({
      message: `Property has been ${status === 'APPROVED' ? 'approved and published live!' : 'rejected.'}`,
      status,
    });
  } catch (error) {
    console.error('Error updating property status:', error);
    res.status(500).json({ error: 'Internal server error updating property status.' });
  }
};

// 5. PUBLIC: Get All Live Approved Properties
export const getPublicProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, suburb, propertyType } = req.query;

    let query = `
      SELECT p.id, p.title, p.description, p.property_type, p.price_cents, p.bedrooms, p.bathrooms,
             p.parking_bays, p.is_furnished, p.available_from, p.created_at,
             l.suburb, l.city, l.street_address,
             o.full_legal_name AS owner_name, o.show_phone_publicly, o.allow_email_contact, o.allow_platform_messages,
             u.email AS owner_email, u.phone_number AS owner_phone,
             (SELECT GROUP_CONCAT(image_url SEPARATOR '||') FROM property_images WHERE property_id = p.id ORDER BY display_order ASC) as all_images,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM properties p
      JOIN owner_profiles o ON p.owner_id = o.id
      JOIN users u ON o.user_id = u.id
      LEFT JOIN property_locations l ON p.id = l.property_id
      WHERE p.status = 'APPROVED'
    `;
    const params: any[] = [];

    if (city) {
      query += ` AND LOWER(l.city) LIKE ?`;
      params.push(`%${String(city).toLowerCase().trim()}%`);
    }
    if (suburb) {
      query += ` AND LOWER(l.suburb) LIKE ?`;
      params.push(`%${String(suburb).toLowerCase().trim()}%`);
    }
    if (propertyType && propertyType !== 'Any Type') {
      query += ` AND p.property_type = ?`;
      params.push(propertyType);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.status(200).json({ properties: rows });
  } catch (error) {
    console.error('Error fetching public properties:', error);
    res.status(500).json({ error: 'Internal server error fetching listings.' });
  }
};