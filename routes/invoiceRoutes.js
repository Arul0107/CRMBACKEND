const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET routes
router.get('/', invoiceController.getAll);
router.get('/types', invoiceController.getInvoiceTypes);
router.get('/leads/active', invoiceController.getActiveBusinesses);
router.get('/business/:id', invoiceController.getInvoicesByBusinessId);
router.get('/business/:id/payments', invoiceController.getPaymentsByBusinessId);
router.get('/:id', invoiceController.getInvoiceById);


// NEW ROUTE: Convert Proforma to Invoice

// POST & PUT routes
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.put('/:id/paymentHistory', invoiceController.updatePaymentHistory);

// PATCH routes
router.patch('/:id/close', invoiceController.closeInvoice);
router.patch('/:id/unlock', invoiceController.unlockInvoice);
router.patch('/:id/payments', invoiceController.addPayment);
router.patch('/:id/convert-to-invoice', invoiceController.convertToInvoice);

// DELETE
router.delete('/:id', invoiceController.remove);

module.exports = router;
