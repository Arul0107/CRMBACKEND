// Quotation.js
const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  name: String,
  value: String
}, { _id: false });

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  description: String,
  hsnSac: String,
  quantity: Number,
  quantityType: String,
  rate: Number,
  specifications: [specificationSchema],
  gstPercentage: { type: Number, default: 18 } // Added gstPercentage to itemSchema
}, { _id: false });

const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
  author: String
}, { _id: false });

// Define the followUpSchema correctly with the 'addedBy' field referencing 'User'
const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { // <--- ADDED: New status field for follow-ups
    type: String,
    enum: ['pending', 'completed'], // Or 'open', 'closed', etc.
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Define the GST Details Schema
const gstDetailsSchema = new mongoose.Schema({
  sgst: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  calculatedTotalGst: { type: Number, default: 0 },
  manualGstAmount: { type: Number, default: null }, // Absolute manual override
  manualSgstPercentage: { type: Number, default: null }, // Manual SGST percentage override
  manualCgstPercentage: { type: Number, default: null }, // Manual CGST percentage override
  finalTaxAmountUsed: { type: Number, default: 0 }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount', required: true },
  businessName: String,
  businessType: String,
  businessInfo: String,
  gstin: String,
  followUps: [followUpSchema],

  quotationNumber: { type: String, unique: true, required: true },
  date: String,
  validUntil: String,
  mobileNumber: { type: String}, // mobileNumber is now required

  customerName: String,
  customerEmail: String, // Added customerEmail
  customerAddress: String, // Keep customerAddress if still relevant, though formatBusinessInfo might render it
  items: [itemSchema],
  subTotal: Number,
  tax: Number,
  total: Number,
  createdDate: String,
  notes: [noteSchema],
  pdfUrl: String,
  gstType: String,
  status: { // <--- ADDED: New status field for the main quotation
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  gstDetails: gstDetailsSchema // Added GST details sub-document
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
