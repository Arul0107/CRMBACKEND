const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET all invoices
router.get('/', invoiceController.getAll);

// GET invoice type options
router.get('/types', invoiceController.getInvoiceTypes);

// GET active businesses for invoice selection
router.get('/leads/active', invoiceController.getActiveBusinesses);

// CREATE a new invoice
router.post('/', invoiceController.create);

// UPDATE an invoice (blocked if locked)
router.put('/:id', invoiceController.update);

// DELETE an invoice
router.delete('/:id', invoiceController.remove);

// PATCH: Lock (close) an invoice
router.patch('/:id/close', invoiceController.closeInvoice);

// PATCH: Unlock an invoice
router.patch('/:id/unlock', invoiceController.unlockInvoice);
router.patch('/:id/payments', invoiceController.addPayment);
router.put('/:id/paymentHistory', invoiceController.updatePaymentHistory);
// Add this above other dynamic routes like /:id/payments
router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;
