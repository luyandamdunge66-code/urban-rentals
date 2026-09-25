import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. OWNER: Get Own Verification Profile & Status
export const getMyOwnerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, u.email, u.phone_number 
       FROM owner_profiles o
       JOIN users u ON o.user_id = u.id
       WHERE o.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Owner profile not found.' });
      return;
    }

    res.status(200).json({ profile: rows[0] });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    res.status(500).json({ error: 'Internal server error fetching owner profile.' });
  }
};

// 2. OWNER: Submit Complete Verification Details
export const submitVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      fullLegalName,
      dateOfBirth,
      idPassportNumber,
      alternativeContact,
      preferredContactMethod,
      residentialCity,
      residentialSuburb,
      residentialAddress,
      residentialPostalCode,
    } = req.body;

    if (
      !fullLegalName ||
      !dateOfBirth ||
      !idPassportNumber ||
      !residentialCity ||
      !residentialSuburb ||
      !residentialAddress ||
      !residentialPostalCode
    ) {
      res.status(400).json({ error: 'All personal and residential fields are compulsory.' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE owner_profiles 
       SET full_legal_name = ?,
           date_of_birth = ?,
           id_passport_number = ?,
           alternative_contact = ?,
           preferred_contact_method = ?,
           residential_city = ?,
           residential_suburb = ?,
           residential_address = ?,
           residential_postal_code = ?,
           verification_status = 'PENDING'
       WHERE user_id = ?`,
      [
        fullLegalName.trim(),
        dateOfBirth,
        idPassportNumber.trim(),
        alternativeContact ? alternativeContact.trim() : null,
        preferredContactMethod || 'PLATFORM',
        residentialCity.trim(),
        residentialSuburb.trim(),
        residentialAddress.trim(),
        residentialPostalCode.trim(),
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Owner profile not found.' });
      return;
    }

    res.status(200).json({
      message: 'Verification information submitted successfully.',
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ error: 'Internal server error submitting verification.' });
  }
};

// 3. OWNER: Update Public Contact Preferences
export const updatePrivacySettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { showPhonePublicly, allowEmailContact, allowPlatformMessages } = req.body;

    await pool.query(
      `UPDATE owner_profiles 
       SET show_phone_publicly = ?,
           allow_email_contact = ?,
           allow_platform_messages = ?
       WHERE user_id = ?`,
      [
        Boolean(showPhonePublicly),
        Boolean(allowEmailContact),
        Boolean(allowPlatformMessages),
        userId,
      ]
    );

    res.status(200).json({ message: 'Privacy settings updated.' });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Internal server error updating privacy settings.' });
  }
};

// 4. ADMIN: Fetch ALL Owners
export const getPendingOwners = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.id AS owner_profile_id, o.user_id, o.full_legal_name, o.date_of_birth,
              o.id_passport_number, o.alternative_contact, o.preferred_contact_method,
              o.residential_city, o.residential_suburb, o.residential_address, o.residential_postal_code,
              o.verification_status, o.created_at, o.approval_date,
              u.email, u.phone_number
       FROM owner_profiles o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    console.log(`🛡️ [ADMIN] Fetching owners. Database returned ${rows.length} owner(s).`);

    res.status(200).json({ pendingOwners: rows });
  } catch (error) {
    console.error('Error fetching owners for admin:', error);
    res.status(500).json({ error: 'Internal server error fetching owners.' });
  }
};

// 5. ADMIN: View Full Owner Dossier
export const getOwnerDetailsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ownerProfileId } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, u.email, u.phone_number, u.created_at AS user_registered_at
       FROM owner_profiles o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [ownerProfileId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Owner profile not found.' });
      return;
    }

    res.status(200).json({ owner: rows[0] });
  } catch (error) {
    console.error('Error fetching owner details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 6. ADMIN: Approve, Reject, or Suspend an Owner
export const updateOwnerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { ownerProfileId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }

    await pool.query(
      `UPDATE owner_profiles 
       SET verification_status = ?,
           approved_by = ?,
           approval_date = ?,
           rejection_reason = ?
       WHERE id = ?`,
      [
        status,
        status === 'APPROVED' ? adminId : null,
        status === 'APPROVED' ? new Date() : null,
        rejectionReason || null,
        ownerProfileId,
      ]
    );

    res.status(200).json({
      message: `Owner status updated to ${status}.`,
      status,
    });
  } catch (error) {
    console.error('Error updating owner status:', error);
    res.status(500).json({ error: 'Internal server error updating status.' });
  }
};

// 7. ADMIN: Permanently Delete Owner
export const deleteOwnerAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ownerProfileId } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, full_legal_name FROM owner_profiles WHERE id = ?',
      [ownerProfileId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Owner not found.' });
      return;
    }

    const ownerName = rows[0].full_legal_name;
    const userId = rows[0].user_id;

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      message: `Owner "${ownerName}" has been permanently deleted.`,
    });
  } catch (error) {
    console.error('Error deleting owner:', error);
    res.status(500).json({ error: 'Internal server error deleting owner.' });
  }
};// 8. ADMIN: Get All Registered Users
export const getAllUsersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, full_name, email, phone_number, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.status(200).json({ users: rows });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error fetching all users.' });
  }
};
