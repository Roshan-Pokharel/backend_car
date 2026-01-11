require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ OAuth2 Error:", error);
    } else {
        console.log("✅ OAuth2 Authenticated & Ready!");
    }
});

module.exports = transporter;