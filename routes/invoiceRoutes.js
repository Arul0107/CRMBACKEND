// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/close', controller.closeInvoice);
router.patch('/:id/unlock', controller.unlockInvoice);

router.get('/leads/active', controller.getActiveBusinesses);

module.exports = router;
