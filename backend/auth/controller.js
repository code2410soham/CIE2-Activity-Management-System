/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/auth/controller.js
 * Purpose: Authentication Controller — handles HTTP requests, input validation, calls AuthService,
 *          and logs audit events for every login attempt and password change.
 */

const authService = require('./service');
const logger = require('../utils/logger');

/**
 * Handle new user registration requests
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await authService.registerUser({ username, email, password, role });
    logger.audit('REGISTER_SUCCESS', { email, role });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    logger.error(error, { context: 'register' });
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Handle user login credentials and session/token generation
 */
exports.login = async (req, res, next) => {
  const { role, prn, employeeId, email, password } = req.body || {};

  // Input guard — prevent empty-body crashes that trigger blank responses
  if (!role || !password) {
    logger.audit('LOGIN_FAIL', { reason: 'Missing role or password in request body', role });
    return res.status(400).json({ success: false, error: 'Role and password are required.' });
  }

  const identifier = prn || employeeId || email || '(unknown)';

  try {
    const token = await authService.loginUser({ role, prn, employeeId, email, password });

    const mustChangePassword = (role === 'student' && password === prn);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.audit('LOGIN_SUCCESS', {
      role,
      identifier,
      ip: req.ip || req.connection?.remoteAddress,
      mustChangePassword,
    });

    return res.status(200).json({ success: true, token, mustChangePassword });
  } catch (error) {
    logger.audit('LOGIN_FAIL', {
      role,
      identifier,
      ip: req.ip || req.connection?.remoteAddress,
      reason: error.message,
    });
    // Always 401 for auth failures — never 500 (which would trigger empty-body retries)
    return res.status(401).json({ success: false, error: error.message });
  }
};

/**
 * Terminate user session
 */
exports.logout = (req, res) => {
  res.clearCookie('token');
  logger.audit('LOGOUT', { userId: req.user?.id });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * Retrieve verified session information
 */
exports.getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    logger.error(error, { context: 'getCurrentUser' });
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Handle user password updates/changes
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, error: 'Unauthorized access.' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'currentPassword and newPassword are required.' });
  }

  try {
    await authService.changeUserPassword(req.user.id, currentPassword, newPassword);

    logger.audit('PASSWORD_CHANGE_SUCCESS', {
      userId: req.user.id,
      ip: req.ip || req.connection?.remoteAddress,
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    logger.audit('PASSWORD_CHANGE_FAIL', {
      userId: req.user.id,
      reason: error.message,
    });
    logger.error(error, { context: 'changePassword', userId: req.user.id });
    return res.status(400).json({ success: false, error: error.message });
  }
};
