// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ✅ CORS Configuration
const corsOptions = {
  origin: 'https://crmfrontend-sage.vercel.app', // your frontend domain
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests

app.use(express.json());

// ✅ CORS Test Route (Optional - For Debugging)
app.get('/cors-test', (req, res) => {
  res.json({ message: '✅ CORS is working properly' });
});

// ✅ Route files
const businessRoutes = require('./routes/businessAccountRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', businessRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes);

// ✅ Health check route
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
