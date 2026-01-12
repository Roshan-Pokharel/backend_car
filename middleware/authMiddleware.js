const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    let token = null;

    // ALWAYS check the Header FIRST for mobile compatibility
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // Only check cookies if no header is present
    else if (req.cookies && req.cookies.adminAuthToken) {
        token = req.cookies.adminAuthToken;
    }

    if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ success: false, message: "No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
        req.admin = decoded;
        next();
    } catch (error) {
        console.log("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: "Token invalid." });
    }
};

module.exports = { verifyAdmin };