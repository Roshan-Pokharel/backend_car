require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Must be false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // --- ADVANCED CLOUD FIXES ---
    family: 4,               // Force IPv4
    connectionTimeout: 20000, // Increase to 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 25000,
    dnsTimeout: 10000,
    tls: {
        // This prevents the connection from hanging during the security upgrade
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    debug: true, 
    logger: true 
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error.message);
        console.error("Full Error Code:", error.code);
    } else {
        console.log("✅ Nodemailer is ready (Port 587)!");
    }
});

module.exports = transporter;