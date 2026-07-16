/**
 * CIE2-Activity-Management-System
 * File: backend/evaluation/routes.js
 * Purpose: Express router definition mapping endpoints for instructor evaluations, grading rubrics, and feedback logs.
 * Scalability: Decoupled design allowing concurrent development on the evaluation component.
 */

const express = require('express');
const router = express.Router();
const evaluationController = require('./controller');

// Evaluation Endpoints
router.get('/pending', evaluationController.getPendingList);
router.post('/submit', evaluationController.submitEvaluation);
router.get('/report/:courseId', evaluationController.getCourseEvaluationReport);

module.exports = router;
