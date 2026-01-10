const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL for better deliverability
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// This checks if your Gmail connection is actually working when the server starts
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Setup Error:", error.message);
        console.error("Check if you are using a Google App Password, not your regular password.");
    } else {
        console.log("✅ Nodemailer is ready to send emails!");
    }
});

module.exports = transporter;