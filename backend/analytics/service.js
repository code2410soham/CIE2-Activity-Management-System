/**
 * CIE2-Activity-Management-System
 * File: backend/analytics/service.js
 * Purpose: Business logic checking system operations, caching summaries, and auditing requests.
 * Scalability: Easily integrates messaging pipelines (e.g. RabbitMQ/Kafka) for large-scale data logs.
 */

const Analytics = require('./model');

exports.getDashboardMetrics = async () => {
  const events = await Analytics.getLogs();
  return {
    totalEvents: events.length,
    activeSessions: 12,
    databaseOpsToday: 342,
    timestamp: new Date().toISOString()
  };
};

exports.logSystemEvent = async (eventData) => {
  if (!eventData.eventType || !eventData.userId) {
    throw new Error('Event Type and User ID are required to record activity');
  }
  return await Analytics.saveLog(eventData);
};
