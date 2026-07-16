/**
 * CIE2-Activity-Management-System
 * File: backend/activities/model.js
 * Purpose: Defines Activity database schemes and queries.
 * Scalability: Decouples DB drivers from high-level logic.
 */

const mockDb = [
  { id: 'act-1', title: 'Data Structures Lab - Trees & Graphs', type: 'lab', maxMarks: 20, deadline: '2026-10-24T23:59:59Z' },
  { id: 'act-2', title: 'Database Systems Quiz 3', type: 'quiz', maxMarks: 10, deadline: '2026-10-26T23:59:59Z' }
];

class Activity {
  static async find() {
    return mockDb;
  }

  static async findById(id) {
    return mockDb.find(a => a.id === id) || null;
  }

  static async create(data) {
    const newAct = {
      id: Date.now().toString(),
      title: data.title,
      type: data.type,
      maxMarks: data.maxMarks || 20,
      deadline: data.deadline || new Date().toISOString()
    };
    mockDb.push(newAct);
    return newAct;
  }

  static async update(id, data) {
    const idx = mockDb.findIndex(a => a.id === id);
    if (idx === -1) return null;
    mockDb[idx] = { ...mockDb[idx], ...data };
    return mockDb[idx];
  }

  static async delete(id) {
    const idx = mockDb.findIndex(a => a.id === id);
    if (idx === -1) return false;
    mockDb.splice(idx, 1);
    return true;
  }
}

module.exports = Activity;
