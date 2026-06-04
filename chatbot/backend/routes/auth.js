import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chatbot-super-secret-key-12345!';

// Transporter configuration (reads SMTP details from environment if available)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Helper function to send email or fallback to console logs
async function sendVerificationEmail(email, name, code) {
  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      await transporter.sendMail({
        from: `"AI Chatbot Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'AI Chatbot - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; color: #333;">
            <h2 style="color: #6366f1;">Welcome to AI Chatbot, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address to get started.</p>
            <p>Your 6-digit verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #1f2937; border: 1px solid #e5e7eb;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #6b7280;">This code will expire in 1 hour.</p>
          </div>
        `,
      });
      console.log(`✉️ Verification email successfully sent to ${email}`);
      return true;
    } catch (error) {
      console.error('SMTP email error, falling back to console logging:', error.message);
    }
  }

  // Fallback console log for developer convenience
  console.log(`
==================================================
✉️  [MOCK EMAIL SENT TO ${email}]
👤  Name: ${name}
🔑  Verification Code: ${code}
💡  (Developer mode: Use this code to verify)
==================================================
  `);
  return false;
}

// 1. User Registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store user
    db.prepare(`
      INSERT INTO users (id, name, email, password, is_verified, verification_code, verification_expires)
      VALUES (?, ?, ?, ?, 0, ?, datetime('now', '+1 hour'))
    `).run(id, name, email.toLowerCase(), hashedPassword, verificationCode);

    // Send email or log code
    await sendVerificationEmail(email, name, verificationCode);

    res.status(201).json({
      message: 'Registration successful! Verification code sent.',
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// 2. Email Verification
router.post('/verify', (req, res) => {
  const { email, code } = req.body;

  if (!email?.trim() || !code?.trim()) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check expiration (compare SQLite date with current time in UTC)
    const isExpired = db.prepare(`
      SELECT 1 WHERE datetime('now') > ?
    `).get(user.verification_expires);

    if (isExpired) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Verify user
    db.prepare(`
      UPDATE users 
      SET is_verified = 1, verification_code = NULL, verification_expires = NULL 
      WHERE id = ?
    `).run(user.id);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

// 3. User Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.is_verified === 0) {
      return res.status(403).json({
        error: 'Email is not verified yet.',
        verified: false,
        email: user.email
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 4. Resend Verification Code
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update code and expiry
    db.prepare(`
      UPDATE users 
      SET verification_code = ?, verification_expires = datetime('now', '+1 hour') 
      WHERE id = ?
    `).run(verificationCode, user.id);

    await sendVerificationEmail(user.email, user.name, verificationCode);

    res.json({ message: 'Verification code resent successfully!' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error during resend' });
  }
});

export default router;
