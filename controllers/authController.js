const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminsecretkey = process.env.ADMIN_SECRET_KEY;

// Admin Registration
module.exports.registerAdmin = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const AdminLength = await Admin.countDocuments();

        // Constraint: Only one admin allowed
        if (AdminLength > 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Admin already exists. Please login." 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create Admin
        const newAdmin = await Admin.create({ username, password: hash, email });
        
        // Create Token
        const token = jwt.sign({ email, id: newAdmin._id }, adminsecretkey, { expiresIn: '7d' });

        // Send Cookie (Backup for desktop)
        res.cookie('adminAuthToken', token, { 
            httpOnly: true, 
            secure: true,      
            sameSite: 'None',  
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        // Send Success JSON WITH TOKEN
        return res.status(201).json({ 
            success: true, 
            message: "Admin registered successfully",
            token: token // <--- Added token here
        });

    } catch (err) {
        console.error("Registration Error:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Admin Login
module.exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Incorrect email or password" });
        }

        const isMatchAdmin = await bcrypt.compare(password, admin.password);

        if (!isMatchAdmin) {
            return res.status(401).json({ success: false, message: "Incorrect email or password" });
        }

        const token = jwt.sign({ email, id: admin._id }, adminsecretkey, { expiresIn: '7d' });

        // Send Cookie (Backup for desktop)
        res.cookie('adminAuthToken', token, {
            httpOnly: true,
            secure: true,       
            sameSite: 'None',   
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ 
            success: true, 
            message: "Login successful",
            token: token, // <--- Added token here
            admin: { username: admin.username, email: admin.email }
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "Login failed due to server error" });
    }
};

// Admin Logout
module.exports.logoutAdmin = (req, res) => {
    try {
        res.clearCookie('adminAuthToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/' 
        });

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
};