/**
 * CIE2-Activity-Management-System
 * File: backend/auth/service.js
 * Purpose: Authentication Service representing the core business logic layer. Performs password checking, token issues, etc.
 * Scalability: Business layer that remains completely decoupled from HTTP request frameworks.
 */

const User = require('./model');

/**
 * Business logic to register a new user in the system
 */
exports.registerUser = async (userData) => {
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User already exists with this email address');
  }
  // In production, encrypt password before saving (e.g., bcrypt)
  return await User.create(userData);
};

/**
 * Business logic to authenticate credentials and issue tokens
 */
exports.loginUser = async ({ email, password }) => {
  const user = await User.findByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password credentials');
  }
  // Generate and return JWT token
  return 'mock-jwt-token-string';
};
