/**
 * CIE2-Activity-Management-System
 * File: backend/activities/controller.js
 * Purpose: Activities Controller managing HTTP actions for assigning, listing, and configuring activities.
 * Scalability: Standardised error mapping to ensure uniform API behavior.
 */

const activitiesService = require('./service');

exports.list = async (req, res) => {
  try {
    const list = await activitiesService.getAllActivities();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const activity = await activitiesService.getActivityById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newActivity = await activitiesService.createActivity(req.body);
    return res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await activitiesService.updateActivity(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await activitiesService.deleteActivity(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    return res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
