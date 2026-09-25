import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Hash a plain-text password using 12 salt rounds
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Compare a plain-text password against a stored hash
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate a 15-minute Access Token
export const generateAccessToken = (payload: { id: string; role: string }): string => {
  const secret = process.env.JWT_SECRET || 'urban_rentals_fallback_secret';
  return jwt.sign(payload, secret, { expiresIn: '15m' });
};

// Generate a random, cryptographically secure 6-digit OTP code
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Hash the OTP before storing it in the database for security
export const hashOTP = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};