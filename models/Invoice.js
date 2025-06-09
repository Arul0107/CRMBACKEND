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
  // Unique invoice number (sparse for optional use)
  invoiceNumber: { type: String, unique: true, sparse: true },      // For 'Invoice' type
  proformaNumber: { type: String, unique: true, sparse: true },     // For 'Proforma' type

  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount' },
  businessName: String,             // Denormalized for display
  customerName: String,
  customerAddress: String,
  customerGSTIN: String,
  companyGSTIN: String,
  companyName: String,
  companyAddress: String,
  contactPerson: String,
  contactNumber: String,

  date: String,
  dueDate: String,

  items: [
    {
      description: String,
      hsnSac: String,
      quantity: Number,
      rate: Number
    }
  ],

  subTotal: Number,
  tax: Number,
  taxRate: { type: Number, default: 18 },
  totalAmount: Number,
  discountAmount: { type: Number, default: 0 },

  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  paymentHistory: [paymentSchema],

  invoiceType: {
    type: String,
    enum: ['Invoice', 'Proforma'],
    default: 'Invoice'
  },
  // NEW FIELD: conversionStatus for Proforma Invoices
  conversionStatus: {
    type: String,
    enum: ['pending', 'converted', 'rejected'], // Define your desired states
    default: 'pending' // Default state for new Proforma invoices
  },

  proformaStatus: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'cancelled', 'converted'], // Added 'converted' status
    default: 'draft'
  },

  notes: [noteSchema],
  paymentTerms: String,
  isClosed: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);