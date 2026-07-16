/**
 * CIE2-Activity-Management-System
 * File: backend/activities/service.js
 * Purpose: Service layer logic for manipulating and validating activities.
 * Scalability: Easily integrates compliance hooks, database triggers, or notification hooks.
 */

const Activity = require('./model');

exports.getAllActivities = async () => {
  return await Activity.find();
};

exports.getActivityById = async (id) => {
  return await Activity.findById(id);
};

exports.createActivity = async (data) => {
  if (!data.title || !data.type) {
    throw new Error('Title and Type are mandatory to define an activity');
  }
  return await Activity.create(data);
};

exports.updateActivity = async (id, data) => {
  return await Activity.update(id, data);
};

exports.deleteActivity = async (id) => {
  return await Activity.delete(id);
};
