// backend/controllers/quotationController.js
const Quotation = require('../models/Quotation');
const Business = require('../models/BusinessAccount');

// GET all quotations
exports.getAll = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

// POST create a quotation with auto-generated quotation number
exports.create = async (req, res) => {
  try {
    const lastQuotation = await Quotation.findOne().sort({ createdAt: -1 });
    let nextNumber = "Qun-0001";

    if (lastQuotation && lastQuotation.quotationNumber) {
      const lastNumber = parseInt(lastQuotation.quotationNumber.split('-')[1], 10);
      const newNumber = lastNumber + 1;
      nextNumber = `Q-${String(newNumber).padStart(4, '0')}`;
    }

    const newQuotation = new Quotation({
      ...req.body,
      quotationNumber: nextNumber
    });

    const saved = await newQuotation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update a quotation
exports.update = async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a quotation
exports.remove = async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
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
