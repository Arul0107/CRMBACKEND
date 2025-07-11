const BusinessAccount = require('../models/BusinessAccount');
const Quotation = require('../models/Quotation');

// Get all accounts (leads + customers)
exports.getAll = async (req, res) => {
    try {
        const accounts = await BusinessAccount.find()
            .populate('assignedTo', 'name role')
            .populate('followUps.addedBy', 'name');
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get leads by source type
exports.getLeadsBySource = async (req, res) => {
    try {
        const { sourceType } = req.params;
        // Adjusted to exclude 'Customer' status
        const leads = await BusinessAccount.find({
            status: { $ne: 'Customer' }, // Exclude 'Customer' status
            sourceType: sourceType
        }).populate('assignedTo', 'name role');
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads by source', error: error.message });
    }
};

// Get only active leads (not customers)
exports.getActiveLeads = async (req, res) => {
    try {
          // Changed to use status 'Active' and exclude 'Customer' status
          const leads = await BusinessAccount.find({ status: 'Active' })
            .populate('assignedTo', 'name role')
            .populate('followUps.addedBy', 'name');
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get only customers
exports.getCustomers = async (req, res) => {
    try {
        // Now directly filters by status 'Customer'
        const customers = await BusinessAccount.find({ status: 'Customer' })
            .populate('assignedTo', 'name role')
            .populate('followUps.addedBy', 'name');
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get business account by ID
exports.getAccountById = async (req, res) => {
    try {
        const account = await BusinessAccount.findById(req.params.id)
            .populate('assignedTo', 'name role')
            .populate('followUps.addedBy', 'name');
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE new business account
exports.create = async (req, res) => {
    try {
        const data = { ...req.body };
        // Set isCustomer based on the initial status
        if (data.status === 'Customer') {
            data.isCustomer = true;
        } else {
            data.isCustomer = false;
        }

        const newAccount = new BusinessAccount(data);
        const savedAccount = await newAccount.save();
        const populatedAccount = await BusinessAccount.findById(savedAccount._id)
            .populate('assignedTo', 'name role');
        res.status(201).json(populatedAccount);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// UPDATE business account
exports.update = async (req, res) => {
    try {
        const data = { ...req.body };
        // Update isCustomer based on the new status
        if (data.status === 'Customer') {
            data.isCustomer = true;
        } else {
            data.isCustomer = false;
        }

        const updated = await BusinessAccount.findByIdAndUpdate(
            req.params.id,
            data, // Pass the modified data
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name role');

        if (!updated) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(updated);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// Soft DELETE business account (set status to 'Closed')
exports.delete = async (req, res) => {
    try {
        const account = await BusinessAccount.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.status = 'Closed';
        account.isCustomer = false; // A closed account is no longer considered a customer
        await account.save();

        res.status(200).json({ message: 'Account status set to Closed', account });
    } catch (err) {
        console.error('Error in soft delete:', err);
        res.status(500).json({ error: err.message || 'Server error during status update' });
    }
};

// ADD note to an account
exports.addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, timestamp, author } = req.body;
        const account = await BusinessAccount.findById(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        account.notes.push({ text, timestamp, author });
        await account.save();
        res.status(200).json({ message: 'Note added successfully', notes: account.notes });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add note', error: error.message });
    }
};

// Quotation related functions
exports.addQuotation = async (req, res) => {
    res.status(501).json({ message: 'Add quotation not implemented yet.' });
};

exports.getQuotations = async (req, res) => {
    res.status(501).json({ message: 'Get quotations not implemented yet.' });
};

// GET follow-ups by account ID
exports.getFollowUpsByAccountId = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await BusinessAccount.findById(id)
            .populate('followUps.addedBy', 'name');
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account.followUps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follow-ups', error: error.message });
    }
};

// ADD follow-up
exports.addFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, note, addedBy, status } = req.body;
        const account = await BusinessAccount.findById(id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.followUps.push({ date, note, addedBy, status });
        await account.save();

        res.status(201).json({ message: 'Follow-up added successfully', followUps: account.followUps });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add follow-up', error: error.message });
    }
};

// UPDATE follow-up by index
exports.updateFollowUp = async (req, res) => {
    const { id, index } = req.params;
    const { date, note, status } = req.body;

    try {
        const account = await BusinessAccount.findById(id);
        if (!account || !account.followUps[index]) {
            return res.status(404).json({ message: 'Follow-up not found' });
        }

        account.followUps[index].date = date;
        account.followUps[index].note = note;
        account.followUps[index].status = status;
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