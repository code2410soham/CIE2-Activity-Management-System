/**
 * CIE2-Activity-Management-System
 * File: backend/submissions/model.js
 * Purpose: Defines Submission database schemas and query interfaces.
 * Scalability: Easily integrates database connection drivers.
 */

const mockDb = [
  { id: 'sub-101', activityId: 'act-1', studentId: '4SO23CS001', filePath: 'uploads/submissions/sub-101.zip', status: 'pending', marks: null, feedback: null }
];

class Submission {
  static async find() {
    return mockDb;
  }

  static async findById(id) {
    return mockDb.find(s => s.id === id) || null;
  }

  static async create(data) {
    const newSub = {
      id: 'sub-' + Date.now().toString(),
      activityId: data.activityId,
      studentId: data.studentId,
      filePath: data.filePath,
      status: 'pending',
      marks: null,
      feedback: null
    };
    mockDb.push(newSub);
    return newSub;
  }

  static async updateGrade(id, { marks, feedback, status }) {
    const idx = mockDb.findIndex(s => s.id === id);
    if (idx === -1) return null;
    mockDb[idx].marks = marks;
    mockDb[idx].feedback = feedback;
    mockDb[idx].status = status;
    return mockDb[idx];
  }
}

module.exports = Submission;
