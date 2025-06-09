// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Route files
const businessRoutes = require('./routes/businessAccountRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// ✅ Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/accounts', businessRoutes);       // BusinessAccount API
app.use('/api/quotations', quotationRoutes);    // Quotations API
app.use('/api/invoices', invoiceRoutes);        // Invoices API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);        // Products API
// ✅ Test route (optional)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working fine 🎉' });
});

// ✅ Connect DB and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
  });
});
