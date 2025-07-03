require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ✅ CORS Configuration
// This config allows requests from your Vercel frontend.
const corsOptions = {
  origin: ["https://crmfrontend-sage.vercel.app"],
  credentials: true, // Allow cookies to be sent with cross-origin requests
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed request headers
};

app.use(cors(corsOptions)); // Apply CORS to all incoming requests
app.options("*", cors(corsOptions)); // Handle preflight requests for all routes

app.use(express.json()); // Middleware to parse JSON request bodies

// ✅ Route files
// Import all your route files
const businessRoutes = require('./routes/businessAccountRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const notesRoutes = require('./routes/notesRoutes'); // Ensure this uses the corrected file from our previous discussion

// ✅ Route mounting
// Mount your imported routes under specific base paths
app.use('/api/auth', authRoutes);
app.use('/api/accounts', businessRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes); // Products will be accessed via /api/product, /api/product/:id etc.
app.use('/api', notesRoutes);   // Notes will be accessed via /api/business-accounts/:id/notes, /api/:model/:id/notes/:noteId etc.

// ✅ Test route
// A simple route to check if the server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working fine 🎉' });
});

// ✅ Start server after DB connects
// Connect to MongoDB and then start the Express server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000
  app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
    console.log(`Frontend Origin configured: ${corsOptions.origin}`);
  });
}).catch(err => {
  console.error("Failed to connect to the database:", err.message);
  process.exit(1); // Exit process with failure
});