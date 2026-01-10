const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // --- TIMEOUT & NETWORK FIXES ---
    // These must be at the ROOT level, not inside 'connectionOptions'
    family: 4,              // Forces IPv4 (Critical fix for Render/Cloud timeouts)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 5000
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error.message);
        // Optional: details to help debug if it fails again
        if (error.code === 'ETIMEDOUT') {
            console.error("👉 Tip: Check if your firewall blocks port 465 or if IPv6 is active.");
        }
    } else {
        console.log("✅ Nodemailer is ready to send emails!");
    }
});

module.exports = transporter;