const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: String,
  hsnSac: String,
  quantity: Number,
  rate: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount', required: true },
  businessName: String,
  businessType: String,
  businessInfo: String,
  gstin: String,
  invoiceNumber: { type: String, unique: true },
  date: String,
  dueDate: String,
  customerName: String,
  customerAddress: String,
  items: [itemSchema],
  subTotal: Number,
  tax: Number,
  total: Number,
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  isClosed: { type: Boolean, default: false }, // ✅ ADDED
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
