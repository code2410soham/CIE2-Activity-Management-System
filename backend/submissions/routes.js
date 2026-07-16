/**
 * CIE2-Activity-Management-System
 * File: backend/submissions/routes.js
 * Purpose: Express router definition mapping endpoints for student submissions (uploading files, checking status).
 * Scalability: Fully decoupled endpoints enabling isolated modification by developers.
 */

const express = require('express');
const router = express.Router();
const submissionsController = require('./controller');

// Submissions Endpoints
router.get('/', submissionsController.list);
router.get('/:id', submissionsController.get);
router.post('/', submissionsController.submit);
router.put('/:id/evaluate', submissionsController.evaluate);

module.exports = router;
