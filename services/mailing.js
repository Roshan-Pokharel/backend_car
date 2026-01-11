require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,              // CHANGE: Use 587 instead of 465
    secure: false,          // CHANGE: Must be false for port 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Network & Debug Settings
    family: 4,              // Keep this (Force IPv4)
    debug: true,            // NEW: Show verbose logs to debug the hang
    logger: true,           // NEW: Log interaction to console
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error);
    } else {
        console.log("✅ Nodemailer is ready to send emails (Port 587)!");
    }
});

module.exports = transporter;