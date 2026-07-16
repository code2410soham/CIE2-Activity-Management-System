/**
 * CIE2-Activity-Management-System
 * File: backend/auth/model.js
 * Purpose: Defines User model schemas and database query abstractions.
 * Scalability: Isolates structural queries so schema updates only affect this component.
 */

// Mock database connection for startup verification
const mockDb = [];

class User {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.username = data.username;
    this.email = data.email;
    this.password = data.password; // Plain text for mock, hash in prod
    this.role = data.role || 'student';
  }

  static async findByEmail(email) {
    return mockDb.find(u => u.email === email) || null;
  }

  static async create(userData) {
    const newUser = new User(userData);
    mockDb.push(newUser);
    return newUser;
  }
}

module.exports = User;
