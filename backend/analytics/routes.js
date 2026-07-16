/**
 * CIE2-Activity-Management-System
 * File: backend/analytics/routes.js
 * Purpose: Express router definition mapping endpoints for application usage stats, student interaction counts, and system performance.
 * Scalability: Fully decoupled endpoints enabling isolated modification by developers.
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('./controller');

// Analytics Endpoints
router.get('/dashboard-summary', analyticsController.getSummary);
router.post('/log-activity', analyticsController.logEvent);

module.exports = router;
