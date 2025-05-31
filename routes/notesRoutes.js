// routes/notesRoutes.js
const express = require('express');
const router = express.Router();
const BusinessAccount = require('../models/BusinessAccount');
const Invoice = require('../models/Invoice');
const Note = require('../models/noteModel');
const auth = require('../middleware/auth');

// Add note to business account
router.post('/business-accounts/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const note = {
      text,
      createdBy: req.user.id
    };

    const businessAccount = await BusinessAccount.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true }
    );

    res.json(businessAccount.notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Add note to invoice
router.post('/invoices/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const note = {
      text,
      createdBy: req.user.id
    };

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true }
    );

    res.json(invoice.notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update note
router.put('/:model/:id/notes/:noteId', auth, async (req, res) => {
  try {
    const { model, id, noteId } = req.params;
    const { text } = req.body;

    const Model = model === 'business-accounts' ? BusinessAccount : Invoice;

    const updatedDoc = await Model.findOneAndUpdate(
      { _id: id, 'notes._id': noteId },
      { $set: { 'notes.$.text': text, 'notes.$.timestamp': Date.now() } },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    const updatedNote = updatedDoc.notes.find(note => note._id.toString() === noteId);
    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete note
router.delete('/:model/:id/notes/:noteId', auth, async (req, res) => {
  try {
    const { model, id, noteId } = req.params;

    const Model = model === 'business-accounts' ? BusinessAccount : Invoice;

    const updatedDoc = await Model.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    res.json(updatedDoc.notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;