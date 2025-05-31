// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Business = require('../models/BusinessAccount');

// GET all invoices
exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// POST create a new invoice with auto-generated number
exports.create = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNumber = "INV-0001";

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1], 10);
      const newNum = lastNum + 1;
      nextNumber = `INV-${String(newNum).padStart(4, '0')}`;
    }

    const items = req.body.items || [];
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subTotal * 0.18;
    const total = subTotal + tax;

    const newInvoice = new Invoice({
      ...req.body,
      invoiceNumber: nextNumber,
      subTotal,
      tax,
      total,
      totalAmount: total
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update invoice
exports.update = async (req, res) => {
  try {
    const items = req.body.items || [];
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subTotal * 0.18;
    const total = subTotal + tax;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        subTotal,
        tax,
        total,
        totalAmount: total
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE invoice
exports.remove = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET active business leads
exports.getActiveBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ status: 'Active' });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

// PATCH /api/invoices/:id/close
exports.closeInvoice = async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isClosed: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// PATCH /api/invoices/:id/unlock
exports.unlockInvoice = async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isClosed: false },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
