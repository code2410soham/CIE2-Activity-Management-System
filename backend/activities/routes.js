/**
 * CIE2-Activity-Management-System
 * File: backend/activities/routes.js
 * Purpose: Express router definition mapping endpoints for creating, retrieving, updating, and deleting learning activities.
 * Scalability: Fully decoupled endpoints enabling isolated modification by developers.
 */

const express = require('express');
const router = express.Router();
const activitiesController = require('./controller');

// Activities Endpoints
router.get('/', activitiesController.list);
router.get('/:id', activitiesController.get);
router.post('/', activitiesController.create);
router.put('/:id', activitiesController.update);
router.delete('/:id', activitiesController.delete);

module.exports = router;
