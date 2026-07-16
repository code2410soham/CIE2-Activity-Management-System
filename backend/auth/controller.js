/**
 * CIE2-Activity-Management-System
 * File: backend/auth/controller.js
 * Purpose: Authentication Controller containing methods for processing HTTP requests, validation, and calling AuthService.
 * Scalability: Reusable controllers structured to prevent cross-developer conflicts.
 */

const authService = require('./service');

/**
 * Handle new user registration requests
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    // Call service to register user
    const user = await authService.registerUser({ username, email, password, role });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Handle user login credentials and session/token generation
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.loginUser({ email, password });
    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

/**
 * Terminate user session
 */
exports.logout = (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Retrieve verified session information
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is expected to be populated by authentication middleware
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
