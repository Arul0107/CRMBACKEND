const BusinessAccount = require('../models/BusinessAccount');

// Get all accounts (leads + customers)
exports.getAll = async (req, res) => {
  try {
    const accounts = await BusinessAccount.find().populate('followUps.addedBy', 'name');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only active leads (not customers)
exports.getActiveLeads = async (req, res) => {
  try {
    const leads = await BusinessAccount.find({ status: 'Active', isCustomer: false }).populate('followUps.addedBy', 'name');
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

// Add a follow-up to a lead
exports.addFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, followupDate, addedBy } = req.body;

    const account = await BusinessAccount.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.followUps.push({ comment, followupDate, addedBy });
    await account.save();

    res.status(200).json({ message: 'Follow-up added successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add follow-up', error: error.message });
  }
};
// Edit a follow-up by index
exports.updateFollowUp = async (req, res) => {
  const { id, index } = req.params;
  const { comment, followupDate } = req.body;

  try {
    const account = await BusinessAccount.findById(id);
    if (!account || !account.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    account.followUps[index].comment = comment;
    account.followUps[index].followupDate = followupDate;
    await account.save();
    res.status(200).json({ message: 'Follow-up updated', account });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow-up', error: error.message });
  }
};

// Delete a follow-up by index
exports.deleteFollowUp = async (req, res) => {
  const { id, index } = req.params;

  try {
    const account = await BusinessAccount.findById(id);
    if (!account || !account.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    account.followUps.splice(index, 1);
    await account.save();
    res.status(200).json({ message: 'Follow-up deleted', account });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting follow-up', error: error.message });
  }
};
