/**
 * CIE2-Activity-Management-System
 * File: backend/evaluation/model.js
 * Purpose: Defines Evaluation records structure and query wrappers.
 * Scalability: Structures items with fields for evaluator references, sub-scores, and metadata.
 */

const mockDb = [
  { id: 'eval-1', submissionId: 'sub-101', evaluatorId: 'EMP458', score: 18, feedback: 'Excellent structural hierarchy.', evaluatedAt: '2026-10-15T12:00:00Z' }
];

class Evaluation {
  static async findPending() {
    // Return empty mock array indicating no current items
    return [];
  }

  static async findByCourse(courseId) {
    return mockDb;
  }

  static async save(data) {
    const newEval = {
      id: 'eval-' + Date.now().toString(),
      submissionId: data.submissionId,
      evaluatorId: data.evaluatorId,
      score: data.score,
      feedback: data.feedback || '',
      evaluatedAt: new Date().toISOString()
    };
    mockDb.push(newEval);
    return newEval;
  }
}

module.exports = Evaluation;
