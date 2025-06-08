const BusinessAccount = require('../models/BusinessAccount');
const Quotation = require('../models/Quotation'); // ADDED: Assuming you have a Quotation model

// Get all accounts (leads + customers)
exports.getAll = async (req, res) => {
  try {
    const accounts = await BusinessAccount.find().populate('followUps.addedBy', 'name');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get leads by source type
exports.getLeadsBySource = async (req, res) => {
  try {
    const { sourceType } = req.params;
    const leads = await BusinessAccount.find({
      isCustomer: false,
      status: 'Active',
      sourceType: sourceType
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads by source', error: error.message }); // Changed to error.message for consistency
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
    // Specific handling for Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Update an account (edit or convert)
exports.update = async (req, res) => {
  try {
    // ADDED: { new: true, runValidators: true } for proper validation on update
    const updated = await BusinessAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // ADDED runValidators: true
    );
    if (!updated) { // Handle case where ID is not found
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(updated);
  } catch (err) {
    // Specific handling for Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete an account (soft delete or actual delete, based on your schema/needs)
exports.delete = async (req, res) => {
  try {
    const deletedAccount = await BusinessAccount.findByIdAndDelete(req.params.id);
    if (!deletedAccount) {
        return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Changed to 500 for general server errors
  }
};

// Get quotations by business account ID
exports.getQuotationsByBusinessId = async (req, res) => {
  try {
    // Ensure Quotation model is imported at the top of the file
    const quotations = await Quotation.find({ businessId: req.params.id });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quotations', error: err.message }); // Added error.message
  }
};

// Get business account by ID
exports.getAccountById = async (req, res) => {
  try {
    const account = await BusinessAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' }); // Changed 'Customer' to 'Account'
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch account', error: err.message }); // Changed 'customer' to 'account'
  }
};

// Get follow-ups by business account ID
exports.getFollowUpsByAccountId = async (req, res) => {
  try {
    const account = await BusinessAccount.findById(req.params.id)
      .populate('followUps.addedBy', 'name email');

    if (!account) return res.status(404).json({ message: 'Account not found' });

    res.json(account.followUps || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch follow-ups', error: err.message });
  }
};

// ADD a follow-up
exports.addFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, note } = req.body;
    // Assuming req.user is populated by authentication middleware.
    // If not, ensure req.body.addedBy is always provided from the client.
    const userId = req.user?.id || req.body.addedBy;

    if (!date || !note || !userId) {
      return res.status(400).json({ message: 'Date, note, and addedBy (or authenticated user) are required' });
    }

    const account = await BusinessAccount.findById(id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    account.followUps.push({ date, note, addedBy: userId });
    await account.save();

    res.status(200).json({ message: 'Follow-up added', followUps: account.followUps });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add follow-up', error: error.message });
  }
};

// UPDATE follow-up by index
exports.updateFollowUp = async (req, res) => {
  const { id, index } = req.params;
  const { date, note } = req.body;

  try {
    const account = await BusinessAccount.findById(id);
    if (!account || !account.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    account.followUps[index].date = date;
    account.followUps[index].note = note;
    await account.save();

    res.status(200).json({ message: 'Follow-up updated', followUps: account.followUps });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow-up', error: error.message });
  }
};

// DELETE follow-up by index
exports.deleteFollowUp = async (req, res) => {
  const { id, index } = req.params;

  try {
    const account = await BusinessAccount.findById(id);
    if (!account || !account.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    account.followUps.splice(index, 1);
    await account.save();

    res.status(200).json({ message: 'Follow-up deleted', followUps: account.followUps });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting follow-up', error: error.message });
  }
};