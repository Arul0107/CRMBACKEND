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

// Define the followUpSchema correctly with the 'addedBy' field referencing 'User'
const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {        // <--- ADDED: New status field
    type: String,
    enum: ['pending', 'completed'], // Or 'open', 'closed', etc.
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false }); // Keep _id: false if you don't want MongoDB's default _id for subdocuments

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

  date: String, // Consider changing to Date type for consistency with followupDate
  dueDate: String, // Consider changing to Date type for consistency

  items: [
    {
      description: String,
      hsnSac: String,
      quantity: Number,
      rate: Number,
      specifications: [{ name: String, value: String }] // Added specifications if they are part of your items
    }
  ],

  subTotal: Number,
  tax: Number,
  taxRate: { type: Number, default: 18 },
  totalAmount: Number,
  discountAmount: { type: Number, default: 0 },
  // Added GST-related fields if your invoices include them
  gstType: { type: String, enum: ['intrastate', 'interstate'], default: 'intrastate' },
  gstPercentage: { type: Number, default: 18 },
  cgstAmount: Number,
  sgstAmount: Number,
  igstAmount: Number,


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
  isClosed: { type: Boolean, default: false },
  
  // THIS IS THE MISSING PART: Add the followUps array here, using the defined followUpSchema
  followUps: [followUpSchema]

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
