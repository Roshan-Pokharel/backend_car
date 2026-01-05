const express = require('express');
const router = express.Router();
const { createQuote, getQuotes , deleteQuote, addCostAndSendEmail} = require('../controllers/quoteController');
const {verifyAdmin} = require('../middleware/authMiddleware');

// Define routes
router.post('/', createQuote);
router.get('/',verifyAdmin, getQuotes);
router.delete('/:id',verifyAdmin, deleteQuote);
router.put('/:id/cost',verifyAdmin, addCostAndSendEmail);

module.exports = router;