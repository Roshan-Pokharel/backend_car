const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    // CRITICAL: Timeout and Connection fixes for Render
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 5000,
    connectionOptions: {
        family: 4 // Forces IPv4 (solves many timeout issues on cloud hosts)
    }
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error.message);
    } else {
        console.log("✅ Nodemailer is ready to send emails!");
    }
});

module.exports = transporter;