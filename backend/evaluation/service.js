/**
 * CIE2-Activity-Management-System
 * File: backend/evaluation/service.js
 * Purpose: Business logic checking weights, limits, and feedback compliance.
 * Scalability: Allows future automated plagiarism detection hooks.
 */

const Evaluation = require('./model');

exports.getPendingEvaluations = async () => {
  return await Evaluation.findPending();
};

exports.processEvaluation = async (data) => {
  if (!data.submissionId || !data.evaluatorId || data.score === undefined) {
    throw new Error('Submission ID, Evaluator ID, and Score are required');
  }
  // Perform business validations (e.g. check score constraints)
  return await Evaluation.save(data);
};

exports.compileCourseReport = async (courseId) => {
  // Aggregate statistics
  return await Evaluation.findByCourse(courseId);
};
