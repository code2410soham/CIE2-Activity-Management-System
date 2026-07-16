/**
 * CIE2-Activity-Management-System
 * File: backend/auth/service.js
 * Purpose: Authentication Service representing the core business logic layer. Performs password checking, token issues, etc.
 * Scalability: Business layer that remains completely decoupled from HTTP request frameworks.
 */

const User = require('./model');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Business logic to register a new user in the system
 */
exports.registerUser = async (userData) => {
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User already exists with this email address');
  }

  // Encrypt password before saving
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  return await User.create({
    ...userData,
    password: passwordHash
  });
};

/**
 * Business logic to authenticate credentials and issue tokens
 */
exports.loginUser = async ({ role, prn, employeeId, email, password }) => {
  let user = null;

  if (role === 'student') {
    if (!prn) throw new Error('PRN is required for student login');
    // For students, check by username (which is ZRPN)
    user = await User.findByUsername(prn);
    if (!user) {
      // Fallback: check by student USN
      const rows = await db.query(
        'SELECT u.* FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE sp.usn = ? AND u.is_deleted = FALSE',
        [prn]
      );
      if (rows.length > 0) {
        user = new User(rows[0]);
      }
    }
  } else if (role === 'teacher') {
    if (!employeeId) throw new Error('Employee ID is required for teacher login');
    // Fetch user through teacher profile
    const rows = await db.query(
      'SELECT u.* FROM users u JOIN teacher_profiles tp ON u.id = tp.user_id WHERE tp.employee_id = ? AND u.is_deleted = FALSE',
      [employeeId]
    );
    if (rows.length > 0) {
      user = new User(rows[0]);
    }
  } else if (role === 'admin') {
    if (!email) throw new Error('Email is required for admin login');
    user = await User.findByEmail(email);
  } else {
    throw new Error('Invalid role specified');
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check role match
  if (user.role !== role) {
    throw new Error('Role mismatch for this user');
  }

  // Verify password using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'cie2_activity_mgmt_jwt_secret_token_19853',
    { expiresIn: '24h' }
  );

  return token;
};

/**
 * Business logic to update user password
 */
exports.changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password does not match');
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await User.updatePassword(userId, newPasswordHash);
  return true;
};
