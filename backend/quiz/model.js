/**
 * CIE2-Activity-Management-System
 * File: backend/quiz/model.js
 * Purpose: Defines Quiz schema structure and query boundaries.
 * Scalability: Structures items with embedded arrays for questions and choices.
 */

const mockDb = [
  {
    id: 'quiz-1',
    title: 'Database Systems Quiz 3',
    questions: [
      {
        questionText: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Language', 'Storage Query Language'],
        correctAnswer: 0
      }
    ]
  }
];

class Quiz {
  static async find() {
    return mockDb;
  }

  static async findById(id) {
    return mockDb.find(q => q.id === id) || null;
  }

  static async create(data) {
    const newQuiz = {
      id: 'quiz-' + Date.now().toString(),
      title: data.title,
      questions: data.questions || []
    };
    mockDb.push(newQuiz);
    return newQuiz;
  }
}

module.exports = Quiz;
