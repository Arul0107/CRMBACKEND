const BusinessAccount = require('../models/BusinessAccount');

// Get all accounts (leads + customers)
exports.getAll = async (req, res) => {
  try {
    const accounts = await BusinessAccount.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only active leads (not customers)
exports.getActiveLeads = async (req, res) => {
  try {
    const leads = await BusinessAccount.find({ status: 'Active', isCustomer: false });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await BusinessAccount.find({ isCustomer: true });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new lead/customer
exports.create = async (req, res) => {
  try {
    const newAccount = new BusinessAccount(req.body);
    const saved = await newAccount.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update an account (edit or convert)
exports.update = async (req, res) => {
  try {
    const updated = await BusinessAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an account
exports.delete = async (req, res) => {
  try {
    await BusinessAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
