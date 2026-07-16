/**
 * CIE2-Activity-Management-System
 * File: backend/reports/controller.js
 * Purpose: Reports Controller managing HTTP requests for exporting metrics.
 * Scalability: Standardised error mapping to ensure uniform API behavior.
 */

const reportsService = require('./service');

exports.getStudentPerformanceReport = async (req, res) => {
  try {
    const report = await reportsService.compileStudentReport(req.params.studentId);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClassPerformanceSummary = async (req, res) => {
  try {
    const report = await reportsService.compileClassSummary(req.params.classId);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
