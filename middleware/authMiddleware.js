// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const token = req.cookies.adminAuthToken; // Read cookie

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. Please login." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
        req.admin = decoded; // Add admin data to request
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = { verifyAdmin };