const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../db/database');

/**
 * POST /api/listing-requests
 * Submits listing claims, corrections, additions, or removal requests.
 * Acceptance A11, A13: Enqueues for manual admin review. NEVER automatically mutates live records.
 */
router.post('/', (req, res) => {
  const db = getDb();
  const {
    request_type,
    programme_id,
    suggested_name,
    requester_name,
    requester_email,
    requester_role,
    evidence_url,
    message
  } = req.body;

  if (!request_type || !['claim', 'correction', 'new_addition', 'removal'].includes(request_type)) {
    return res.status(400).json({ error: 'Valid request type (claim, correction, new_addition, removal) is required.' });
  }

  if (!requester_email || !requester_email.includes('@')) {
    return res.status(400).json({ error: 'Valid requester email is required.' });
  }

  if (!requester_name || !requester_name.trim()) {
    return res.status(400).json({ error: 'Requester name is required.' });
  }

  // Validate URL scheme if evidence_url is provided (Acceptance A22: no SSRF / file / javascript: protocols)
  if (evidence_url && evidence_url.trim()) {
    try {
      const parsed = new URL(evidence_url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Evidence URL must use HTTP or HTTPS protocol.' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid evidence URL format.' });
    }
  }

  const requestId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO listing_requests (
      id, request_type, programme_id, suggested_name, requester_name,
      requester_email, requester_role, evidence_url, message, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    requestId,
    request_type,
    programme_id || null,
    suggested_name || null,
    requester_name.trim(),
    requester_email.trim().toLowerCase(),
    requester_role || 'Visitor',
    evidence_url ? evidence_url.trim() : null,
    message ? message.trim() : null,
    now
  );

  res.status(201).json({
    success: true,
    request_id: requestId,
    message: 'Your listing request has been queued for editorial review. A confirmation receipt has been recorded.'
  });
});

module.exports = router;
