const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  timestamp: String
}, { _id: false });

const businessAccountSchema = new mongoose.Schema({
  businessName: String,
  gstNumber: String,
  contactName: String,
  email: String,
  phoneNumber: String,
  mobileNumber: String,
  addressLine1: String,
  addressLine2: String,
  addressLine3: String,
  landmark: String,
  city: String,
  pincode: Number,
  state: String,
  country: String,
  website: String,
  status: { type: String, default: 'Active' },
  type: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm' },
  notes: [noteSchema]
}, { timestamps: true });

module.exports = mongoose.model('BusinessAccount', businessAccountSchema);