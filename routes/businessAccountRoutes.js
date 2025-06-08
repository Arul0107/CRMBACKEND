const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessAccountController');

// GET all business accounts
router.get('/', controller.getAll);

// GET active leads
router.get('/leads/active', controller.getActiveLeads);

// GET all customers
router.get('/customers', controller.getCustomers);

// ✅ GET leads by source type
router.get('/leads/source/:sourceType', controller.getLeadsBySource);
// ✅ GET business account by ID
router.get('/:id', controller.getAccountById);
router.get('/:id/followups', controller.getFollowUpsByAccountId);
router.post('/:id/followups', controller.addFollowUp);
router.put('/:id/followups/:index', controller.updateFollowUp);
router.delete('/:id/followups/:index', controller.deleteFollowUp);

// CREATE, UPDATE, DELETE
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;