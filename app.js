require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = process.env.ALLOWEDORIGIN
  ? process.env.ALLOWEDORIGIN.split(',').map(origin => origin.trim()) // Trims accidental spaces
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // This will log in your Render logs so you can see the exact blocked URL
      console.error(`CORS Error: Origin ${origin} is not in the allowedOrigins list.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some older browsers/proxies struggle with 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle Preflight (OPTIONS) requests
app.options('*', cors(corsOptions));

// Health check
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

// Routes
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api', require('./routes/otpRoutes'));
app.use('/api/hits', require('./routes/hitRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global Error Handler for CORS errors to prevent app crash
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS policy blocked this request' });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});