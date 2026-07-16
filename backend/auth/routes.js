/**
 * CIE2-Activity-Management-System
 * File: backend/auth/routes.js
 * Purpose: Express router definition mapping endpoints for user registration, authentication, and session control.
 * Scalability: Fully decoupled endpoints enabling isolated modification by developers.
 */

const express = require('express');
const router = express.Router();
const authController = require('./controller');

// Authentication Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;
