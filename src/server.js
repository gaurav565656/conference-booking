require("./models/Building");
require("./models/Department");
require("./models/User");
require("./models/Room");
require("./models/Booking");

const express = require('express');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use("/api/bookings", require("./routes/bookingRoutes"));



// Test route
app.get('/', (req, res) => {
  res.send("🚀 Conference Room Booking API Running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
