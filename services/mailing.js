require('dotenv').config();
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // Must be false for port 587
//     auth: {
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_PASS 
//     },
//     // Adding a timeout and TLS settings for Render's environment
//     connectionTimeout: 10000, // 10 seconds
//     greetingTimeout: 10000,
//     tls: {
//         rejectUnauthorized: false // Helps avoid handshake issues in cloud environments
//     }
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    family: 4, // Forces IPv4 (Gmail often fails on IPv6 in cloud containers)
    connectionTimeout: 20000, // Increase to 20 seconds
    greetingTimeout: 20000,
    tls: {
        rejectUnauthorized: false 
    }
});

// This helps debug the connection in your Render logs immediately on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Error:", error.message);
    } else {
        console.log("Server is ready to send emails");
    }
});

module.exports = transporter;