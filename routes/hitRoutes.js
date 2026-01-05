// routes/hitRoutes.js
const express = require('express');
const router = express.Router();
// Change this line to destructure the specific function
const { trackHit } = require('../controllers/hitController'); 

router.get('/', trackHit);

module.exports = router;