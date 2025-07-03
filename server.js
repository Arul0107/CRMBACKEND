require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ✅ CORS Configuration
const corsOptions = {
  origin: ["https://crmfrontend-sage.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight support
app.use(express.json());

// ✅ Route files
const businessRoutes = require('./routes/businessAccountRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const notesRoutes = require('./routes/notesRoutes'); // Make sure to use the corrected notesRoutes.js file

// ✅ Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/accounts', businessRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes); // This mounts product routes under /api, e.g., /api/product, /api/product/:id
app.use('/api', notesRoutes);   // This mounts notes routes under /api, e.g., /api/business-accounts/:id/notes, /api/:model/:id/notes/:noteId

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working fine 🎉' });
});

// ✅ Start server after DB connects
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
  });
});