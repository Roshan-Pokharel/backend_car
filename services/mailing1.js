require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using Resend API (Bypasses Render SMTP block)
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Once you verify a domain, change this to your email
            to: to,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("❌ Resend Error:", error);
            return { success: false, error };
        }

        console.log("✅ Email sent via API:", data.id);
        return { success: true, data };
    } catch (err) {
        console.error("❌ System Error:", err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };