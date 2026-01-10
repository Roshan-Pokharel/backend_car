const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL - Important for Port 465
    connectionOptions: {
        family: 4
        },
        
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    // Add these timeout settings to prevent the "Timeout" error
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error.message);
    } else {
        console.log("✅ Nodemailer is ready to send emails!");
    }
});

module.exports = transporter;