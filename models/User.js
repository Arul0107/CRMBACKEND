const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
  role: {
    type: String,
    enum: ['Superadmin', 'Admin', 'Employee'],
    default: 'Employee'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
