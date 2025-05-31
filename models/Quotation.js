// backend/models/Quotation.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: String,
  hsnSac: String,
  quantity: Number,
  rate: Number
}, { _id: false });


const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount', required: true },
  businessName: String,
  businessType: String,
  businessInfo: String,
  gstin: String,
  quotationNumber: { type: String, unique: true },
  date: String,
  validUntil: String,
  customerName: String,
  customerAddress: String,
  items: [itemSchema],
  subTotal: Number,
  tax: Number,
  total: Number,
  createdDate: String,
  notes: [noteSchema],
  pdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
