/**
 * CIE2-Activity-Management-System
 * File: backend/evaluation/controller.js
 * Purpose: Evaluation Controller managing HTTP requests for grading criteria and instructor notes.
 * Scalability: Standardised error mapping to ensure uniform API behavior.
 */

const evaluationService = require('./service');

exports.getPendingList = async (req, res) => {
  try {
    const list = await evaluationService.getPendingEvaluations();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.submitEvaluation = async (req, res) => {
  try {
    const evaluation = await evaluationService.processEvaluation(req.body);
    return res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCourseEvaluationReport = async (req, res) => {
  try {
    const report = await evaluationService.compileCourseReport(req.params.courseId);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
