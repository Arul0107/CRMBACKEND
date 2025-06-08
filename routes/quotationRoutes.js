// quotationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotationController');


router.get('/', controller.getAll);

// POST create a new quotation
router.post('/', controller.create);

// PUT update a quotation by ID
router.put('/:id', controller.update);

// DELETE a quotation by ID
router.delete('/:id', controller.remove);

// GET active businesses (for selection in quotation form, etc.)
router.get('/leads/active', controller.getActiveBusinesses);

router.get('/business/:id', controller.getQuotationsByBusinessId);

module.exports = router;