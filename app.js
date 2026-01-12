require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express(); // ✅ CREATE APP FIRST

// Trust proxy (important for Render, AWS, HTTPS cookies)
app.set('trust proxy', 1);

/* =======================
   CORS CONFIG (UPDATED)
======================= */
const allowedOrigins = process.env.ALLOWEDORIGIN
  ? process.env.ALLOWEDORIGIN.split(',')
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    // 2. Check if origin is explicitly in your ALLOWEDORIGIN .env list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } 
    
    // 3. ✅ NEW: Automatically allow any Vercel frontend 
    // This is crucial for mobile compatibility if the URL shifts slightly (e.g., www vs non-www)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Block everything else
    console.log('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Added X-Requested-With for broader mobile support
}));

// Handle preflight requests
app.options('*', cors());

/* =======================
   BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   HEALTH CHECK
======================= */
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

/* =======================
   ROUTES
======================= */
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api', require('./routes/otpRoutes'));
app.use('/api/hits', require('./routes/hitRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});