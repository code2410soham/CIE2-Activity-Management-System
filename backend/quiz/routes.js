/**
 * CIE2-Activity-Management-System
 * File: backend/quiz/routes.js
 * Purpose: Express router definition mapping endpoints for managing quizzes (setting questions, starting quizzes, submitting responses).
 * Scalability: Decoupled design allowing concurrent development on the quiz component.
 */

const express = require('express');
const router = express.Router();
const quizController = require('./controller');

// Quiz Endpoints
router.get('/', quizController.list);
router.post('/', quizController.create);
router.post('/:id/start', quizController.start);
router.post('/:id/submit', quizController.submitQuizAnswers);

module.exports = router;
