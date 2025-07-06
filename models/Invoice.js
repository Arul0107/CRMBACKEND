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

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Define the item schema separately to include productId and productName
const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Reference to Product model
  productName: String, // Product name for display
  description: String,
  hsnSac: String,
  quantity: Number,
  rate: Number,
  specifications: [{ name: String, value: String }]
}, { _id: false }); // Ensure _id is not automatically generated for sub-documents if you don't need it

const invoiceSchema = new mongoose.Schema({
  // Unique invoice number
  invoiceNumber: { type: String, unique: true, sparse: true }, // Only for 'Invoice' type

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
  // NEW FIELDS: Added contactName, email, mobileNumber for the customer/business contact
  contactName: { type: String, required: true },
  email: { type: String, required: true }, // Corrected: Changed type from 'true' to 'String'
  mobileNumber: { type: String, required: true },

  date: String,
  dueDate: String,

  items: [itemSchema], // Changed to use the new itemSchema

  subTotal: Number,
  tax: Number,
  taxRate: { type: Number, default: 18 }, // Default GST rate
  totalAmount: Number,
  discountAmount: { type: Number, default: 0 },

  gstType: { type: String, enum: ['intrastate', 'interstate'], default: 'intrastate' },
  gstPercentage: { type: Number, default: 18 }, // Custom entry for GST percentage
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
    enum: ['Invoice'], // Removed 'Proforma'
    default: 'Invoice'
  },
  

  notes: [noteSchema],
  paymentTerms: String,
  isClosed: { type: Boolean, default: false },
  
  followUps: [followUpSchema]

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
