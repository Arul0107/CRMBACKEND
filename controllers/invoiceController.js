const Invoice = require('../models/Invoice');
const Business = require('../models/BusinessAccount');

// GET all invoices
exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('businessId') // ✅ This fetches business details
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};
// GET invoice type enums
exports.getInvoiceTypes = (req, res) => {
  res.json(['Invoice', 'Proforma']);
};
exports.convertToInvoice = async (req, res) => {
  try {
    const proforma = await Invoice.findById(req.params.id);
    if (!proforma || proforma.invoiceType !== 'Proforma') {
      return res.status(400).json({ error: 'Invalid Proforma invoice' });
    }
    if (proforma.proformaStatus !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed Proforma can be converted' });
    }

    const lastInvoice = await Invoice.findOne({ invoiceType: 'Invoice' }).sort({ createdAt: -1 });
    const nextNumber = lastInvoice?.invoiceNumber 
      ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).padStart(4, '0')}`
      : 'INV-0001';

    const newInvoice = new Invoice({
      ...proforma.toObject(),
      _id: undefined,
      invoiceNumber: nextNumber,
      proformaNumber: proforma.proformaNumber,
      invoiceType: 'Invoice',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newInvoice.save();
    res.json(newInvoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Add new controller for updating Proforma status
exports.updateProformaStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice || invoice.invoiceType !== 'Proforma') {
      return res.status(400).json({ error: 'Invalid Proforma invoice' });
    }

    invoice.proformaStatus = status;
    if (status === 'confirmed') {
      invoice.isClosed = true;
    }
    
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// POST create a new invoice
exports.create = async (req, res) => {
  try {
    let nextNumber;
    if (req.body.invoiceType === 'Proforma') {
      const lastProforma = await Invoice.findOne({ invoiceType: 'Proforma' }).sort({ createdAt: -1 });
      nextNumber = lastProforma?.proformaNumber 
        ? `PRO-${String(parseInt(lastProforma.proformaNumber.split('-')[1]) + 1).padStart(4, '0')}`
        : 'PRO-0001';
    } else {
      const lastInvoice = await Invoice.findOne({ invoiceType: 'Invoice' }).sort({ createdAt: -1 });
      nextNumber = lastInvoice?.invoiceNumber 
        ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).padStart(4, '0')}`
        : 'INV-0001';
    }

    const items = req.body.items || [];
    const subTotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const tax = subTotal * 0.18;
    const totalAmount = subTotal + tax;

    const invoice = new Invoice({
      ...req.body,
      invoiceNumber: req.body.invoiceType === 'Invoice' ? nextNumber : undefined,
      proformaNumber: req.body.invoiceType === 'Proforma' ? nextNumber : undefined,
      subTotal,
      tax,
      totalAmount
    });

    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// PATCH: Add payment to invoice
exports.addPayment = async (req, res) => {
  try {
    const { amount, method, reference, date, addedBy } = req.body;
    const payment = { amount, method, reference, date, addedBy };

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $push: { paymentHistory: payment } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('businessId');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

exports.updatePaymentHistory = async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentHistory: req.body.paymentHistory },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update invoice (blocked if isClosed is true)
exports.update = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.isClosed) return res.status(403).json({ error: 'Invoice is locked and cannot be edited' });

    const items = req.body.items || [];
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subTotal * 0.18;
    const totalAmount = subTotal + tax;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        subTotal,
        tax,
        totalAmount
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

// GET active businesses
exports.getActiveBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ status: 'Active' });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

// PATCH close invoice
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

// PATCH unlock invoice
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
exports.getInvoicesByBusinessId = async (req, res) => {
  try {
    const invoices = await Invoice.find({ businessId: req.params.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};
exports.getPaymentsByBusinessId = async (req, res) => {
  try {
    const invoices = await Invoice.find({ businessId: req.params.id });
    const allPayments = invoices.flatMap(inv => inv.paymentHistory || []);
    res.json(allPayments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};
