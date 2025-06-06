const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
  author: String
}, { _id: false });

const followUpSchema = new mongoose.Schema({
  date: String,
  note: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 👈 Enables population
}, { _id: false });

const businessAccountSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  followUps: [followUpSchema],
  mobileNumber: { type: String, required: true },
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
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  // ✨ NEW FIELDS ADDED BELOW ✨
  sourceType: {
    type: String,
    enum: ['Direct', 'Facebook Referral', 'Google Ads', 'Website', 'Cold Call', 'Other'],
    default: 'Direct'
  },
  referralPersonName: {
    type: String,
    // This field is only required if sourceType is 'Facebook Referral'.
    // The validation logic will be handled on the frontend and potentially in the controller if needed.
  },
  isCustomer: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BusinessAccount', businessAccountSchema);