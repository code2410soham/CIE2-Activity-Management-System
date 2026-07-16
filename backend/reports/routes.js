/**
 * CIE2-Activity-Management-System
 * File: backend/reports/routes.js
 * Purpose: Express router definition mapping endpoints for compilation and download of academic performance metrics.
 * Scalability: Fully decoupled endpoints enabling isolated modification by developers.
 */

const express = require('express');
const router = express.Router();
const reportsController = require('./controller');

// Reports Endpoints
router.get('/performance/:studentId', reportsController.getStudentPerformanceReport);
router.get('/class-summary/:classId', reportsController.getClassPerformanceSummary);

module.exports = router;
