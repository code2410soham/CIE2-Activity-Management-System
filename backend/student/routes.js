/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/student/routes.js
 * Purpose: Express router definition mapping endpoints for student dashboard data retrieval.
 */

const express = require('express');
const router = express.Router();
const studentController = require('./controller');

// GET dashboard endpoint
router.get('/dashboard', studentController.getDashboardData);

module.exports = router;
