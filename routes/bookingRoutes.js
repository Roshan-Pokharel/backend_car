const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking, updateBookingStatus, sendManageOtp, verifyManageOtp, customerCancelBooking, customerUpdateBooking } = require('../controllers/bookingController');
const {verifyAdmin} = require('../middleware/authMiddleware')

router.post('/', createBooking);
router.get('/', verifyAdmin, getBookings); 
router.delete('/:id', verifyAdmin, deleteBooking);
router.put('/:id/status', verifyAdmin, updateBookingStatus);
router.post('/manage/send-otp', sendManageOtp);
router.post('/manage/verify-otp', verifyManageOtp);
router.delete('/manage/cancel/:id', customerCancelBooking);
router.put('/manage/update/:id', customerUpdateBooking);


module.exports = router;