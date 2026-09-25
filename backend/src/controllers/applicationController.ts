import { Response } from 'express';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. RENTER: Submit a Rental Application
export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId, employmentStatus, monthlyIncomeZar, occupantsCount, preferredMoveIn, documents } = req.body;

    if (!propertyId || !employmentStatus || !monthlyIncomeZar || !preferredMoveIn) {
      res.status(400).json({ error: 'Please provide all compulsory application details.' });
      return;
    }

    const applicationId = crypto.randomUUID();
    const monthlyIncomeCents = Math.round(Number(monthlyIncomeZar) * 100);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert Application
      await connection.query<ResultSetHeader>(
        `INSERT INTO applications (
          id, user_id, property_id, employment_status, monthly_income_cents, occupants_count, preferred_move_in, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          applicationId,
          userId,
          propertyId,
          employmentStatus.trim(),
          monthlyIncomeCents,
          Number(occupantsCount) || 1,
          preferredMoveIn,
        ]
      );

      // Insert supporting documents if provided
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          const docId = crypto.randomUUID();
          await connection.query(
            `INSERT INTO application_documents (id, application_id, document_type, file_url) VALUES (?, ?, ?, ?)`,
            [docId, applicationId, doc.type || 'SUPPORTING_DOC', doc.url]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ message: 'Rental application submitted successfully!', applicationId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Internal server error submitting application.' });
  }
};

// 2. RENTER or OWNER: Get Applications (Renters see their sent apps; Owners see incoming apps for their properties)
export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let query = '';
    let params: any[] = [];

    if (role === 'OWNER') {
      query = `
        SELECT a.*, p.title as property_title, u.full_name as applicant_name, u.email as applicant_email, u.phone_number as applicant_phone
        FROM applications a
        JOIN properties p ON a.property_id = p.id
        JOIN owner_profiles o ON p.owner_id = o.id
        JOIN users u ON a.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY a.created_at DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT a.*, p.title as property_title, l.suburb, l.city,
               (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
        FROM applications a
        JOIN properties p ON a.property_id = p.id
        LEFT JOIN property_locations l ON p.id = l.property_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.status(200).json({ applications: rows });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error fetching applications.' });
  }
};

// 3. OWNER: Update Application Status (Approve or Reject)
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid application status. Choose APPROVED or REJECTED.' });
      return;
    }

    await pool.query(
      `UPDATE applications SET status = ? WHERE id = ?`,
      [status, applicationId]
    );

    res.status(200).json({ message: `Rental application status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error updating application status.' });
  }
};