const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessAccountController');

// ✅ GET all business accounts
router.get('/', controller.getAll);

// ✅ GET active leads (used for dropdowns in invoices/quotations)
router.get('/leads/active', controller.getActiveLeads);

// ✅ GET all customers (if implemented separately)
router.get('/customers', controller.getCustomers);

// ✅ CREATE new business account
router.post('/', controller.create);

// ✅ UPDATE existing business account
router.put('/:id', controller.update);

// ✅ DELETE business account
router.delete('/:id', controller.delete);

// ✅ FOLLOW-UP ROUTES
router.post('/:id/followups', controller.addFollowUp);
router.put('/:id/followups/:index', controller.updateFollowUp);
router.delete('/:id/followups/:index', controller.deleteFollowUp);

module.exports = router;
