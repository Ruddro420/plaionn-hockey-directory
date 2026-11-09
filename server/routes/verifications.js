const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { sendVerificationEmail } = require('../services/emailService');

/**
 * POST /api/email-verifications
 * Single-use token verification (Acceptance A09)
 */
router.post('/', (req, res) => {
  const db = getDb();
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'A valid verification token is required.' });
  }

  const record = db.prepare(`
    SELECT v.id, v.token, v.lead_id, v.expires_at, v.used_at, l.email, l.name
    FROM email_verifications v
    JOIN leads l ON v.lead_id = l.id
    WHERE v.token = ?
  `).get(token.trim());

  if (!record) {
    return res.status(404).json({
      error: 'Invalid verification token.',
      code: 'TOKEN_NOT_FOUND',
      message: 'This verification link is invalid or does not exist.'
    });
  }

  const now = new Date().toISOString();

  // Acceptance A09: Check if reused
  if (record.used_at) {
    return res.status(400).json({
      error: 'Verification link already used.',
      code: 'TOKEN_ALREADY_USED',
      message: 'This email verification link has already been used. Your email address is confirmed.'
    });
  }

  // Acceptance A09: Check if expired
  if (record.expires_at < now) {
    return res.status(400).json({
      error: 'Verification link expired.',
      code: 'TOKEN_EXPIRED',
      message: 'This verification link has expired. Please request a new verification link below.',
      lead_email: record.email
    });
  }

  // Atomically mark token used and lead verified
  const transaction = db.transaction(() => {
    db.prepare("UPDATE email_verifications SET used_at = ? WHERE id = ?").run(now, record.id);
    db.prepare("UPDATE leads SET verification_status = 'verified', updated_at = ? WHERE id = ?").run(now, record.lead_id);
  });

  transaction();

  res.json({
    success: true,
    message: 'Your email address has been successfully verified! Your hockey interest is now confirmed.',
    email: record.email
  });
});

/**
 * POST /api/email-verifications/resend
 * Resend verification link safely
 */
router.post('/resend', (req, res) => {
  const db = getDb();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const lead = db.prepare('SELECT id, name, email, verification_status FROM leads WHERE lower(email) = ?').get(email.trim().toLowerCase());
  if (!lead) {
    // Prevent email enumeration: return generic success message
    return res.json({
      success: true,
      message: 'If this email address exists in our system, a new verification link has been dispatched.'
    });
  }

  if (lead.verification_status === 'verified') {
    return res.json({
      success: true,
      already_verified: true,
      message: 'Your email address is already verified!'
    });
  }

  const emailRecord = sendVerificationEmail(lead.id, lead.email, lead.name);

  res.json({
    success: true,
    message: 'A new verification link has been dispatched to your email address.',
    verification_token: emailRecord.token // for dev/testing ease
  });
});

module.exports = router;
