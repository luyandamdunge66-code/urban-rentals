import { Request, Response } from 'express';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/db';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateOTP,
  hashOTP,
} from '../utils/auth';

// 1. REGISTER NEW USER (Renter or Property Owner)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      accountType,
      // Compulsory Owner Verification Fields:
      idPassportNumber,
      dateOfBirth,
      alternativeContact,
      residentialAddress,
      residentialSuburb,
      residentialCity,
      residentialPostalCode,
    } = req.body;

    // Common validations
    if (!fullName || !email || !phoneNumber || !password || !accountType) {
      res.status(400).json({ error: 'Name, email, phone number, and password are required.' });
      return;
    }

    if (!['RENTER', 'OWNER'].includes(accountType)) {
      res.status(400).json({ error: 'Invalid account type. Choose RENTER or OWNER.' });
      return;
    }

    // STRICT OWNER VALIDATION: All legal & residential fields are COMPULSORY
    if (accountType === 'OWNER') {
      if (
        !idPassportNumber ||
        !dateOfBirth ||
        !residentialAddress ||
        !residentialSuburb ||
        !residentialCity ||
        !residentialPostalCode
      ) {
        res.status(400).json({
          error:
            'All owner fields are compulsory: ID/Passport Number, Date of Birth, Street Address, Suburb, City, and Postal Code.',
        });
        return;
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim();

    // Check if email or phone already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, phone_number FROM users WHERE email = ? OR phone_number = ?',
      [cleanEmail, cleanPhone]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.email === cleanEmail) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }
      if (existing.phone_number === cleanPhone) {
        res.status(409).json({ error: 'An account with this phone number already exists.' });
        return;
      }
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert user into users table
    await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, full_name, email, phone_number, password_hash, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, fullName.trim(), cleanEmail, cleanPhone, hashedPassword, accountType]
    );

    // If registering as an Owner, save ALL verified details immediately
    if (accountType === 'OWNER') {
      const ownerProfileId = crypto.randomUUID();
      await pool.query<ResultSetHeader>(
        `INSERT INTO owner_profiles (
          id, user_id, full_legal_name, date_of_birth, id_passport_number, 
          alternative_contact, preferred_contact_method,
          residential_city, residential_suburb, residential_address, residential_postal_code, 
          verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, 'PLATFORM', ?, ?, ?, ?, 'PENDING')`,
        [
          ownerProfileId,
          userId,
          fullName.trim(),
          dateOfBirth,
          idPassportNumber.trim(),
          alternativeContact ? alternativeContact.trim() : null,
          residentialCity.trim(),
          residentialSuburb.trim(),
          residentialAddress.trim(),
          residentialPostalCode.trim(),
        ]
      );
    }

    const token = generateAccessToken({ id: userId, role: accountType });

    res.status(201).json({
      message:
        accountType === 'OWNER'
          ? 'Owner account registered with full verification information. Pending admin approval.'
          : 'Renter account registered successfully.',
      token,
      user: {
        id: userId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phoneNumber: cleanPhone,
        role: accountType,
        verificationStatus: accountType === 'OWNER' ? 'PENDING' : null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};


// 2. LOGIN USER (By Email OR Phone Number)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please enter your email or phone number, and your password.' });
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, full_name, email, phone_number, password_hash, role, is_active 
       FROM users 
       WHERE LOWER(email) = ? OR phone_number = ?`,
      [cleanIdentifier, identifier.trim()]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid email/phone or password.' });
      return;
    }

    const user = users[0];

    if (!user.is_active) {
      res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email/phone or password.' });
      return;
    }

    let verificationStatus: string | null = null;
    if (user.role === 'OWNER') {
      const [ownerRows] = await pool.query<RowDataPacket[]>(
        'SELECT verification_status FROM owner_profiles WHERE user_id = ?',
        [user.id]
      );
      if (ownerRows.length > 0) {
        verificationStatus = ownerRows[0].verification_status;
      }
    }

    const token = generateAccessToken({ id: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        verificationStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// 3. FORGOT PASSWORD (Generate and Dispatch 6-digit OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      res.status(400).json({ error: 'Please enter your registered email or phone number.' });
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find account by email or phone
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, phone_number FROM users WHERE LOWER(email) = ? OR phone_number = ?`,
      [cleanIdentifier, identifier.trim()]
    );

    // Generic response to prevent account enumeration attacks
    if (users.length === 0) {
      res.status(200).json({
        message: 'If an account matches that email or phone number, a verification code has been sent.',
      });
      return;
    }

    const user = users[0];
    const otp = generateOTP();
    const hashedCode = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP record
    const resetId = crypto.randomUUID();
    await pool.query<ResultSetHeader>(
      `INSERT INTO password_reset_codes (id, user_id, hashed_otp, destination_phone, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [resetId, user.id, hashedCode, user.phone_number, expiresAt]
    );

    // Simulated SMS Dispatch (Prints directly to your terminal)
    console.log('\n=============================================');
    console.log(`📱 [SMS GATEWAY SIMULATOR]`);
    console.log(`To: ${user.phone_number}`);
    console.log(`Your Urban Rentals verification code is: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log('=============================================\n');

    res.status(200).json({
      message: 'A verification code has been sent to your registered phone number.',
      phoneHint: user.phone_number.slice(-4), // Shows last 4 digits
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error processing password reset.' });
  }
};

// 4. VERIFY OTP CODE
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      res.status(400).json({ error: 'Identifier and 6-digit OTP code are required.' });
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, phone_number FROM users WHERE LOWER(email) = ? OR phone_number = ?`,
      [cleanIdentifier, identifier.trim()]
    );

    if (users.length === 0) {
      res.status(400).json({ error: 'Invalid or expired verification code.' });
      return;
    }

    const user = users[0];

    // Find the latest active OTP code for this user
    const [codes] = await pool.query<RowDataPacket[]>(
      `SELECT id, hashed_otp, attempts_count, max_attempts, expires_at, is_used 
       FROM password_reset_codes 
       WHERE user_id = ? AND is_used = FALSE 
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (codes.length === 0) {
      res.status(400).json({ error: 'No active verification code found. Please request a new code.' });
      return;
    }

    const codeRecord = codes[0];

    // Check expiration
    if (new Date() > new Date(codeRecord.expires_at)) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    // Check failed attempt limits (max 3)
    if (codeRecord.attempts_count >= codeRecord.max_attempts) {
      res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      return;
    }

    // Verify OTP match
    const hashedInput = hashOTP(otp.trim());
    if (hashedInput !== codeRecord.hashed_otp) {
      // Increment attempt counter
      await pool.query(
        'UPDATE password_reset_codes SET attempts_count = attempts_count + 1 WHERE id = ?',
        [codeRecord.id]
      );
      res.status(400).json({ error: 'Invalid verification code. Please try again.' });
      return;
    }

    res.status(200).json({
      message: 'Verification code confirmed successfully.',
      resetSessionId: codeRecord.id, // Secure session handle for the next step
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error verifying code.' });
  }
};

// 5. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetSessionId, newPassword } = req.body;

    if (!resetSessionId || !newPassword) {
      res.status(400).json({ error: 'Reset session and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Find the valid session code
    const [codes] = await pool.query<RowDataPacket[]>(
      `SELECT id, user_id, is_used, expires_at FROM password_reset_codes WHERE id = ?`,
      [resetSessionId]
    );

    if (codes.length === 0 || codes[0].is_used) {
      res.status(400).json({ error: 'Invalid or already used reset session.' });
      return;
    }

    const codeRecord = codes[0];

    if (new Date() > new Date(codeRecord.expires_at)) {
      res.status(400).json({ error: 'Reset session has expired. Please restart the process.' });
      return;
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password and mark the reset code as used
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      newPasswordHash,
      codeRecord.user_id,
    ]);

    await pool.query('UPDATE password_reset_codes SET is_used = TRUE WHERE id = ?', [
      codeRecord.id,
    ]);

    res.status(200).json({
      message: 'Password successfully changed! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error resetting password.' });
  }
};