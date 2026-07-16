/**
 * CIE2-Activity-Management-System
 * File: backend/submissions/controller.js
 * Purpose: Submissions Controller managing HTTP requests for handling uploads and grading triggers.
 * Scalability: Reusable controllers structured to prevent cross-developer conflicts.
 */

const submissionsService = require('./service');

exports.list = async (req, res) => {
  try {
    const list = await submissionsService.getAllSubmissions();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const submission = await submissionsService.getSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.submit = async (req, res) => {
  try {
    // Expecting files uploaded to uploads/submissions
    const submission = await submissionsService.createSubmission(req.body);
    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.evaluate = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await submissionsService.gradeSubmission(req.params.id, marks, feedback);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
