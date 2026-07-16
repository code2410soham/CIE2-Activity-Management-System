/**
 * CIE2-Activity-Management-System
 * File: backend/analytics/controller.js
 * Purpose: Analytics Controller managing HTTP requests for fetching overall summaries and event logs.
 * Scalability: Standardised error mapping to ensure uniform API behavior.
 */

const analyticsService = require('./service');

exports.getSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getDashboardMetrics();
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.logEvent = async (req, res) => {
  try {
    const log = await analyticsService.logSystemEvent(req.body);
    return res.status(201).json({ success: true, data: log });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
