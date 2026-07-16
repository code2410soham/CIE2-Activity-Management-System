/**
 * CIE2-Activity-Management-System
 * File: backend/analytics/model.js
 * Purpose: Defines Analytics log items database schema.
 * Scalability: Structures items with fields for performance statistics.
 */

const mockDb = [
  { id: 'log-1', userId: '4SO23CS001', eventType: 'SUBMISSION_UPLOAD', message: "User uploaded 'sub-101.zip'", timestamp: '2026-10-15T10:42:01Z' }
];

class Analytics {
  static async getLogs() {
    return mockDb;
  }

  static async saveLog(data) {
    const newLog = {
      id: 'log-' + Date.now().toString(),
      userId: data.userId,
      eventType: data.eventType,
      message: data.message || '',
      timestamp: new Date().toISOString()
    };
    mockDb.push(newLog);
    return newLog;
  }
}

module.exports = Analytics;
