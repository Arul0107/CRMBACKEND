const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET routes
router.get('/', invoiceController.getAll);
router.get('/types', invoiceController.getInvoiceTypes);
router.get('/leads/active', invoiceController.getActiveBusinesses);
router.get('/business/:id', invoiceController.getInvoicesByBusinessId);
router.get('/business/:id/payments', invoiceController.getPaymentsByBusinessId);

// --- CORRECTED FOLLOW-UP ROUTES (associated with Invoice ID) ---
// These specific routes MUST be placed before the general '/:id' route.
router.get('/:id/followups', invoiceController.getFollowUpsByInvoiceId);
router.post('/:id/followups', invoiceController.addFollowUp);
router.put('/:id/followups/:index', invoiceController.updateFollowUp);
router.delete('/:id/followups/:index', invoiceController.deleteFollowUp);

router.get('/:id', invoiceController.getInvoiceById); // This general route should now come after specific ones

// POST & PUT routes
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.put('/:id/paymentHistory', invoiceController.updatePaymentHistory);

// PATCH routes
router.patch('/:id/close', invoiceController.closeInvoice);
router.patch('/:id/unlock', invoiceController.unlockInvoice);
// CORRECTED: This route is for adding a NEW payment, so it should be POST
router.patch('/:id/convert-to-invoice', invoiceController.convertToInvoice);

// This route is for adding a NEW payment to an invoice's paymentHistory array
router.post('/:id/payments', invoiceController.addPayment);

// NEW: Route to delete a specific payment from an invoice
router.delete('/:invoiceId/payments/:paymentId', invoiceController.deletePayment);

// DELETE invoice
router.delete('/:id', invoiceController.remove);

module.exports = router;