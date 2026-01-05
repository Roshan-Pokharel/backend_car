const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Ensure this path is correct
const { createOtp, verifyOtp, submitReview , getReviews, getAllReviews} = require('../controllers/otpController');
const otpStore = require('../services/otpStore');
// --- STORAGE ---
// OTPs stored temporarily here.


// --- 1. Generate OTP Endpoint ---
router.post('/generate-otp', createOtp);

// --- 2. Verify OTP Endpoint ---
router.post('/verify-otp', verifyOtp);

// --- 3. Submit Review Endpoint ---
router.post('/submit-review', submitReview );

// --- 3. Get Review Endpoint ---
router.get('/reviews', getReviews);

// --- 4. Get All Reviews Endpoint ---
router.get('/allreviews', getAllReviews);

module.exports = router;