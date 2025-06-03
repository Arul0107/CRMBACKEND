const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
  author: String
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  amount: Number,
  date: String,
  method: String,
  reference: String,
  addedBy: String
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount' },
  date: String,
  dueDate: String,
  items: [],
  subTotal: Number,
  tax: Number,
  totalAmount: Number,
  status: String,
  notes: [noteSchema],
  isClosed: { type: Boolean, default: false },

  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentHistory: [paymentSchema],
  invoiceType: {
    type: String,
    enum: ['Invoice', 'Proforma'],
    default: 'Invoice'
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
