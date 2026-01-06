require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Use process.env to access variables from .env file
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

module.exports = transporter;