/**
 * CIE2-Activity-Management-System
 * File: backend/auth/model.js
 * Purpose: Defines User model schemas and database query abstractions.
 * Scalability: Isolates structural queries so schema updates only affect this component.
 */

const db = require('../db');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password_hash; // maps password_hash to password
    this.role = data.role;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findByUsername(username) {
    try {
      const rows = await db.query(
        'SELECT * FROM users WHERE username = ? AND is_deleted = FALSE',
        [username]
      );
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (err) {
      console.error('Error in User.findByUsername:', err);
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const rows = await db.query(
        'SELECT * FROM users WHERE email = ? AND is_deleted = FALSE',
        [email]
      );
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (err) {
      console.error('Error in User.findByEmail:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const rows = await db.query(
        'SELECT * FROM users WHERE id = ? AND is_deleted = FALSE',
        [id]
      );
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (err) {
      console.error('Error in User.findById:', err);
      throw err;
    }
  }

  static async create(userData) {
    try {
      const id = userData.id || `usr-${Date.now()}`;
      await db.query(
        'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userData.username, userData.email, userData.password, userData.role || 'student', true]
      );
      return new User({
        id,
        username: userData.username,
        email: userData.email,
        password_hash: userData.password,
        role: userData.role || 'student',
        is_active: true
      });
    } catch (err) {
      console.error('Error in User.create:', err);
      throw err;
    }
  }

  static async updatePassword(id, newPasswordHash) {
    try {
      await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, id]
      );
      return true;
    } catch (err) {
      console.error('Error in User.updatePassword:', err);
      throw err;
    }
  }
}

module.exports = User;
