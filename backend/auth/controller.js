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
    const { role, prn, employeeId, email, password } = req.body;

    // Call service to check login
    const token = await authService.loginUser({
      role,
      prn,
      employeeId,
      email,
      password
    });

    // Determine if student is using their default credentials (ZRPN as password)
    const mustChangePassword = (role === 'student' && password === prn);

    // Set cookie if needed, and return response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({ success: true, token, mustChangePassword });
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

/**
 * Terminate user session
 */
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Retrieve verified session information
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by authentication middleware
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Handle user password updates/changes
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized access.' });
    }

    await authService.changeUserPassword(req.user.id, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
