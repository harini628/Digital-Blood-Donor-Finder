require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const donorRoutes = require('./routes/donorRoutes');
const path = require('path');

const app = express();

// Import and configure CORS
const cors = require('cors');
app.use(cors({
  origin: ['https://harini628.github.io', 'http://localhost:5000', 'http://localhost:3000'],
  credentials: true
}));

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donor_finder')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/donors', donorRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Routes for pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/add-donor.html", (req, res) => res.sendFile(path.join(__dirname, "public", "add-donor.html")));
app.get("/find-donor.html", (req, res) => res.sendFile(path.join(__dirname, "public", "find-donor.html")));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

