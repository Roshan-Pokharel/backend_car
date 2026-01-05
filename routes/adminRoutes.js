const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, logoutAdmin } = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Define API Routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/check-auth', verifyAdmin, (req, res) => {
    res.status(200).json({ success: true, admin: req.admin });
});

module.exports = router;