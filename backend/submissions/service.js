/**
 * CIE2-Activity-Management-System
 * File: backend/submissions/service.js
 * Purpose: Business logic for managing submissions, validating constraints, and scoring.
 * Scalability: Logic isolates evaluation limits and check schedules.
 */

const Submission = require('./model');

exports.getAllSubmissions = async () => {
  return await Submission.find();
};

exports.getSubmissionById = async (id) => {
  return await Submission.findById(id);
};

exports.createSubmission = async (data) => {
  if (!data.activityId || !data.studentId || !data.filePath) {
    throw new Error('Activity ID, Student ID, and File Path are required to submit');
  }
  return await Submission.create(data);
};

exports.gradeSubmission = async (id, marks, feedback) => {
  if (marks < 0) {
    throw new Error('Marks cannot be negative');
  }
  return await Submission.updateGrade(id, { marks, feedback, status: 'evaluated' });
};
