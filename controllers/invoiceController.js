const Invoice = require('../models/Invoice');
const Business = require('../models/BusinessAccount'); // Assuming this model exists and is correct

// GET all invoices
exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('businessId') // Keep populating for full business details if needed elsewhere
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// POST create a new invoice
exports.create = async (req, res) => {
  try {
    const { items, taxRate = 18, discountAmount = 0, invoiceType, ...rest } = req.body;
    let nextNumber;
    let invoiceFields = {}; // Object to hold the specific number field to be added

    if (invoiceType === 'Proforma') {
      const lastProforma = await Invoice.findOne({ invoiceType: 'Proforma' }).sort({ createdAt: -1 });
      nextNumber = lastProforma?.proformaNumber
        ? `PRO-${String(parseInt(lastProforma.proformaNumber.split('-')[1]) + 1).padStart(4, '0')}`
        : 'PRO-0001';
      invoiceFields.proformaNumber = nextNumber;
    } else { // 'Invoice'
      const lastInvoice = await Invoice.findOne({ invoiceType: 'Invoice' }).sort({ createdAt: -1 });
      nextNumber = lastInvoice?.invoiceNumber
        ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).padStart(4, '0')}`
        : 'INV-0001';
      invoiceFields.invoiceNumber = nextNumber;
    }

    const calculatedItems = items || [];
    const subTotal = calculatedItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subTotal * (taxRate / 100);
    const totalAmount = subTotal + tax - discountAmount;

    const invoice = new Invoice({
      ...rest,
      ...invoiceFields, // Spread the specific number field here (only one will be present)
      invoiceType,
      items: calculatedItems,
      subTotal,
      tax,
      taxRate,
      discountAmount,
      totalAmount,
      // Denormalize business/customer details from the request body
      businessName: req.body.businessName,
      customerName: req.body.customerName,
      customerAddress: req.body.customerAddress,
      customerGSTIN: req.body.customerGSTIN,
      companyGSTIN: req.body.companyGSTIN,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      contactPerson: req.body.contactPerson,
      contactNumber: req.body.contactNumber,
      paymentTerms: req.body.paymentTerms,
    });

    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(400).json({ error: err.message });
  }
};

// GET invoice type enums
exports.getInvoiceTypes = (req, res) => {
  res.json(['Invoice', 'Proforma']);
};

// Convert Proforma to Invoice
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
    const nextInvoiceNumber = lastInvoice?.invoiceNumber
      ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).padStart(4, '0')}`
      : 'INV-0001';

    // Create a new Invoice document from the Proforma, clearing _id and proformaNumber
    const newInvoiceData = proforma.toObject();
    delete newInvoiceData._id;             // Remove the _id to create a new document
    delete newInvoiceData.proformaNumber;  // Crucially remove proformaNumber from the new document
    delete newInvoiceData.proformaStatus;  // Clear proforma status for the new invoice

    const newInvoice = new Invoice({
      ...newInvoiceData,
      invoiceNumber: nextInvoiceNumber,
      invoiceType: 'Invoice',
      isClosed: false, // New invoice is not closed by default
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newInvoice.save();

    // Optionally update the original proforma to mark it as converted and close it
    proforma.proformaStatus = 'converted'; // Add a new status if needed
    proforma.isClosed = true; // Close the original proforma
    await proforma.save();

    res.json(newInvoice);
  } catch (err) {
    console.error("Error converting proforma to invoice:", err);
    res.status(400).json({ error: err.message });
  }
};

// Update Proforma status
exports.updateProformaStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.invoiceType !== 'Proforma') {
      return res.status(400).json({ error: 'Invalid Proforma invoice' });
    }

    invoice.proformaStatus = status;
    if (status === 'confirmed' || status === 'cancelled' || status === 'converted') { // Added 'converted'
      invoice.isClosed = true;
    } else {
      invoice.isClosed = false; // Allow editing if status changes back from confirmed
    }

    await invoice.save();
    res.json(invoice);
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
      {
        $push: { paymentHistory: payment },
        // You might want to update paymentStatus here based on total paid vs totalAmount
      },
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

    const { items, taxRate = 18, discountAmount = 0, ...rest } = req.body;

    const calculatedItems = items || [];
    const subTotal = calculatedItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subTotal * (taxRate / 100);
    const totalAmount = subTotal + tax - discountAmount;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        items: calculatedItems,
        subTotal,
        tax,
        taxRate,
        discountAmount,
        totalAmount,
        // Denormalize business/customer details from the request body if they are being updated
        businessName: req.body.businessName,
        customerName: req.body.customerName,
        customerAddress: req.body.customerAddress,
        customerGSTIN: req.body.customerGSTIN,
        companyGSTIN: req.body.companyGSTIN,
        companyName: req.body.companyName,
        companyAddress: req.body.companyAddress,
        contactPerson: req.body.contactPerson,
        contactNumber: req.body.contactNumber,
        paymentTerms: req.body.paymentTerms,
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

exports.convertToInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Proforma Invoice
    const proformaInvoice = await Invoice.findById(id);

    if (!proformaInvoice) {
      return res.status(404).json({ error: 'Proforma Invoice not found.' });
    }

    if (proformaInvoice.invoiceType !== 'Proforma') {
      return res.status(400).json({ error: 'Only Proforma Invoices can be converted.' });
    }

    if (proformaInvoice.conversionStatus === 'converted') {
      return res.status(400).json({ error: 'This Proforma Invoice has already been converted.' });
    }

    // Generate a new sequential invoice number
    // This logic should be robust to avoid duplicates and handle concurrency
    const lastInvoice = await Invoice.findOne({ invoiceType: 'Invoice' })
                                     .sort({ createdAt: -1 });

    let nextInvoiceNumber;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1]); // Assuming format INV-XXXX
      nextInvoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      nextInvoiceNumber = 'INV-0001';
    }

    // Update the Proforma Invoice to a regular Invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        invoiceType: 'Invoice',
        invoiceNumber: nextInvoiceNumber,
        conversionStatus: 'converted',
        $unset: { proformaNumber: 1 } // Remove proformaNumber after conversion
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedInvoice) {
      return res.status(500).json({ error: 'Failed to convert Proforma to Invoice.' });
    }

    res.json(updatedInvoice);
  } catch (err) {
    console.error("Error converting Proforma to Invoice:", err);
    res.status(500).json({ error: 'Server error during conversion.' });
  }
};