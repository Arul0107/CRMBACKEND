const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessAccountController');

router.get('/', controller.getAll);
router.get('/leads/active', controller.getActiveLeads);
router.get('/customers', controller.getCustomers);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
