const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessAccountController');
const User = require('../models/User'); // ✅ Import User model to fetch all users

// ✅ Route to get all users for "Assigned To" dropdown
router.get('/users/all', async (req, res) => {
  try {
    const users = await User.find({}, 'name role'); // Return only name and role
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all business accounts
router.get('/', controller.getAll);

// GET only customers (isCustomer: true)
router.get('/customers', controller.getCustomers);

// GET active leads
router.get('/leads/active', controller.getActiveLeads);

// GET leads by source type
router.get('/leads/source/:sourceType', controller.getLeadsBySource);

// CRUD operations for accounts
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// GET a business account by ID
router.get('/:id', controller.getAccountById);

// Follow-up routes
router.get('/:id/followups', controller.getFollowUpsByAccountId);
router.post('/:id/followups', controller.addFollowUp);
router.put('/:id/followups/:index', controller.updateFollowUp);
router.delete('/:id/followups/:index', controller.deleteFollowUp);

module.exports = router;
