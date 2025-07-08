// BusinessAccount.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
  author: String
}, { _id: false });

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
}, { _id: false });

const businessAccountSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  sourceType: {
    type: String,
    enum: ['Direct', 'Facebook', 'Google Ads', 'Website', 'Cold Call', 'Other'], // UPDATED ENUM VALUES
    default: 'Other'
  },
  gstNumber: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  phoneNumber: String,
  followUps: [followUpSchema],
  addressLine1: { type: String, required: true },
  addressLine2: String,
  addressLine3: String,
  landmark: String,
  city: { type: String, required: true },
  pincode: { type: Number, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  website: String,
  type: { type: String, enum: ['Hot', 'Warm', 'Cold'], required: true },
  notes: [noteSchema],
  // UPDATED: Added 'Waiting' and 'Closed' to the status enum
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Active', 'Inactive', 'Pipeline', 'Closed'], default: 'Active' },
  isCustomer: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BusinessAccount', businessAccountSchema);
