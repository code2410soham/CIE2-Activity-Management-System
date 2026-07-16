/**
 * CIE2-Activity-Management-System
 * File: backend/quiz/service.js
 * Purpose: Business logic for starting attempts and grading MCQ quizzes.
 * Scalability: Isolated scoring algorithms make it easy to incorporate negative marking rules later.
 */

const Quiz = require('./model');

exports.getAllQuizzes = async () => {
  return await Quiz.find();
};

exports.createQuiz = async (data) => {
  if (!data.title || !data.questions) {
    throw new Error('Title and Questions array are required to configure a Quiz');
  }
  return await Quiz.create(data);
};

exports.startQuizAttempt = async (quizId, studentId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }
  // Record dynamic attempt session
  return { quizId, studentId, startTime: new Date().toISOString(), durationLimit: 600 };
};

exports.evaluateQuiz = async (quizId, studentId, answers) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }
  
  let score = 0;
  // Dynamic grading logic checking quiz.questions correct answers
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.correctAnswer) {
      score += 1;
    }
  });
  return score;
};
