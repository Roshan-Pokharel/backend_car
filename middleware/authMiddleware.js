const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    let token;

    // 1. PRIORITIZE HEADER (Best for Mobile/Cross-Site)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (e) {
            token = null;
        }
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to Cookie
    else if (req.cookies.adminAuthToken) {
        token = req.cookies.adminAuthToken;
    }
    
    // 2. Fallback to Cookie (Best for Desktop/Same-Site)
    // else if (req.cookies && req.cookies.adminAuthToken) {
    //     token = req.cookies.adminAuthToken;
    // }

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. Please login." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
        req.admin = decoded; 
        next();
    } catch (error) {
        // If token is expired or invalid
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = { verifyAdmin };