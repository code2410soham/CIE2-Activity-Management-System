/**
 * CIE2-Activity-Management-System
 * File: backend/quiz/controller.js
 * Purpose: Quiz Controller managing HTTP requests for configuring questions, starting, and submitting quizzes.
 * Scalability: Standardised error mapping to ensure uniform API behavior.
 */

const quizService = require('./service');

exports.list = async (req, res) => {
  try {
    const list = await quizService.getAllQuizzes();
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    return res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.start = async (req, res) => {
  try {
    const quizAttempt = await quizService.startQuizAttempt(req.params.id, req.body.studentId);
    return res.status(200).json({ success: true, data: quizAttempt });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.submitQuizAnswers = async (req, res) => {
  try {
    const score = await quizService.evaluateQuiz(req.params.id, req.body.studentId, req.body.answers);
    return res.status(200).json({ success: true, score });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
