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
  invoiceNumber: String, // For 'Invoice' type
  proformaNumber: String, // For 'Proforma' type
  
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount' },
  businessName: String, // Denormalized for easier display
  customerName: String, // Denormalized
  customerAddress: String, // Denormalized
  customerGSTIN: String, // Denormalized for customer's GSTIN
  companyGSTIN: String, // To store your company's GSTIN
  companyName: String, // To store your company name
  companyAddress: String, // To store your company address
  contactPerson: String, // Customer contact person
  contactNumber: String, // Customer contact number

  date: String,
  dueDate: String,
  items: [
    {
      description: String,
      hsnSac: String,
      quantity: Number,
      rate: Number,
    }
  ],
  subTotal: Number,
  tax: Number,
  taxRate: { type: Number, default: 18 }, // New field for tax rate
  totalAmount: Number,
  discountAmount: { type: Number, default: 0 }, // Added discount field
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentHistory: [paymentSchema],
  invoiceType: {
    type: String,
    enum: ['Invoice', 'Proforma'],
    default: 'Invoice'
  },
  proformaStatus: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'cancelled'],
    default: 'draft'
  },
  notes: [noteSchema],
  paymentTerms: String, // New field for payment terms
  isClosed: { type: Boolean, default: false }, // Renamed from status to isClosed for clarity and avoid conflict with paymentStatus

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);