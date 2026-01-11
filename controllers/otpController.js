const Review = require('../models/Review.js'); 
// UPDATE: Import the new sendEmail function instead of transporter
const { sendEmail } = require('../services/mailing'); 
const otpStore = require('../services/otpStore');

const getEmailTemplate = (otp) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
            .header { background-color: #333333; color: #ffffff; padding: 20px; text-align: center; }
            .content { padding: 30px; text-align: center; color: #555555; }
            .otp-box { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2c3e50; background-color: #f0f3f6; padding: 15px; margin: 20px 0; border-radius: 5px; border: 2px dashed #bdc3c7; display: inline-block; }
            .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h2>Oz Tint And Wrap</h2></div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to verify your identity. Please use the One-Time Password (OTP) below to proceed.</p>
                <div class="otp-box">${otp}</div>
                <p>This code is valid for 10 minutes.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Oz Tint And Wrap.</div>
        </div>
    </body>
    </html>
`;

exports.createOtp = async (req, res) => { 
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const existingReview = await Review.findOne({ email: email });
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already submitted a review. Thank you!' 
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;

        // OTP expiration (10 minutes)
        setTimeout(() => delete otpStore[email], 10 * 60 * 1000);

        // --- UPDATED EMAIL SENDING LOGIC ---
        const result = await sendEmail({
            to: email,
            subject: 'Your Verification Code',
            html: getEmailTemplate(otp)
        });

        if (result.success) {
            res.json({ success: true, message: 'OTP sent to your email.' });
        } else {
            // Handle Resend specific errors
            console.error('Email failed:', result.error);
            res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
        }
        // -----------------------------------

    } catch (error) {
        console.error('[ERROR]', error);
        res.status(500).json({ success: false, message: 'Server error checking email.' });
    }
}

exports.verifyOtp = (req, res) => {
    const { userOtp, email } = req.body;

    if (!email || !userOtp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    if (otpStore[email] && otpStore[email] === userOtp) {
        delete otpStore[email]; 
        res.json({ success: true, message: 'OTP Verified!' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
}

exports.submitReview = async (req, res) => {
    try {
        const { name, carModel, rating, review, email } = req.body;
        
        const existingReview = await Review.findOne({ email: email });
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'A review for this email already exists.' 
            });
        }

        await Review.create({
            name,
            email,
            carModel,
            rating,
            review,
            date: new Date()
        });
        
        // Cleanup OTP just in case
        if(otpStore[email]) delete otpStore[email];

        res.json({ success: true, message: 'Review submitted successfully!' });

    } catch (error) {
        console.error('[DB ERROR]', error);
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === 11000) {
             return res.status(400).json({ success: false, message: 'You have already reviewed us.' });
        }
        res.status(500).json({ success: false, message: 'Server error saving review.' });
    }
}

exports.getReviews = async (req, res) => {
    try {
        const [reviews, stats] = await Promise.all([
            Review.find({}, 'name carModel rating review date')
                .sort({ rating: -1, date: -1 }) 
                .limit(6), 
            Review.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])
        ]);

        const globalStats = stats.length > 0 ? stats[0] : { averageRating: 0, totalReviews: 0 };

        res.json({
            reviews,
            totalCount: globalStats.totalReviews,
            averageRating: globalStats.averageRating
        });

    } catch (error) {
        console.error('[DB ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
}

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}, 'name carModel rating review date');
        res.json({ reviews });
    } catch (error) {
        console.error('[DB ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
}