const Booking = require('../models/Booking');
const otpStore = require('../services/otpStore'); // Ensure this matches your directory
const transporter = require('../services/mailing'); // Ensure this matches your directory

// --- HELPER: Professional Email Template Generator ---
// This standardizes the look of all emails sent by the system.
const generateEmailTemplate = (title, content, footerText = '') => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <div style="background-color: #1e293b; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Oz Tint & Wrap</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">${title}</p>
      </div>

      <div style="padding: 30px; color: #334155; line-height: 1.6;">
        ${content}
      </div>

      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Oz Tint & Wrap. All rights reserved.<br>
          ${footerText}
        </p>
      </div>
    </div>
  </div>
  `;
};

// 1. Create a New Booking
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();

    const { 
      firstName, lastName, email, phone, 
      make, model, year, serviceName, date, 
      selectedShade, selectedCoverage, selectedHeadlights 
    } = savedBooking;

    // --- Admin Notification Content ---
    const adminContent = `
      <h2 style="color: #1e293b; margin-top: 0;">New Booking Request</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Customer</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${firstName} ${lastName}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${email}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${phone}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Vehicle</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${year} ${make} ${model}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Service</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">${serviceName}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Requested Date</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${date}</td></tr>
        ${selectedShade ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Shade</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${selectedShade}</td></tr>` : ''}
        ${selectedCoverage ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Coverage</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${selectedCoverage}</td></tr>` : ''}
        ${selectedHeadlights ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Headlights</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${selectedHeadlights}</td></tr>` : ''}
      </table>
    `;

    // --- Customer Receipt Content ---
    const customerContent = `
      <h2 style="color: #1e293b;">Booking Received!</h2>
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Thanks for choosing Oz Tint & Wrap. We have received your request for <strong>${serviceName}</strong> on <strong>${date}</strong>.</p>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Vehicle:</strong> ${year} ${make} ${model}</p>
      </div>
      <p>Our team will review your request and contact you shortly to confirm the details.</p>
    `;

    // Send Emails in Parallel
    await Promise.all([
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Booking: ${serviceName} - ${date}`,
        html: generateEmailTemplate('Admin Notification', adminContent)
      }),
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Booking Confirmation - Oz Tint & Wrap',
        html: generateEmailTemplate('Customer Receipt', customerContent)
      })
    ]);

    res.status(201).json({ success: true, message: "Booking confirmed", data: savedBooking });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 2. Get All Bookings (Admin)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. Delete Booking (Admin)
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 4. Update Booking Status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted', 'Completed', or 'Cancelled'

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    let emailTitle = 'Status Update';
    let emailBody = '';

    if (status === 'Accepted') {
      emailTitle = 'Booking Accepted';
      emailBody = `
        <h2 style="color: #059669;">You're Booked In!</h2>
        <p>Hi ${booking.firstName},</p>
        <p>Your appointment for <strong>${booking.serviceName}</strong> has been <strong>confirmed</strong>.</p>
        <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">📅 Date: ${booking.date}</p>
        <p>We look forward to seeing you.</p>
      `;
    } else if (status === 'Completed') {
      emailTitle = 'Service Completed';
      emailBody = `
        <h2 style="color: #2563eb;">Service Complete</h2>
        <p>Hi ${booking.firstName},</p>
        <p>Your <strong>${booking.serviceName}</strong> for the ${booking.model} is complete.</p>
        <p>Thank you for your business! Drive safely.</p>
      `;
    } else if (status === 'Cancelled') {
      emailTitle = 'Booking Cancelled';
      emailBody = `
        <h2 style="color: #dc2626;">Booking Cancelled</h2>
        <p>Hi ${booking.firstName},</p>
        <p>Your booking for ${booking.date} has been cancelled.</p>
        <p>If this was a mistake, please contact us immediately.</p>
      `;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: `Booking Update: ${status}`,
      html: generateEmailTemplate(emailTitle, emailBody)
    });

    res.status(200).json({ success: true, message: `Status updated to ${status}` });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Send OTP for Customer Management
exports.sendManageOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const bookingExists = await Booking.findOne({ email });
    
    if (!bookingExists) {
      return res.status(404).json({ success: false, message: 'No bookings found for this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    setTimeout(() => delete otpStore[email], 10 * 60 * 1000); // Expires in 10 mins

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Manage Your Booking - Verification Code',
      html: generateEmailTemplate('Identity Verification', `
          <h2>Your Verification Code</h2>
          <p>Please use the code below to access your booking dashboard:</p>
          <div style="background: #e2e8f0; color: #1e293b; padding: 15px 30px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
              ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">This code expires in 10 minutes.</p>
      `)
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error sending OTP' });
  }
};

// 6. Verify OTP
exports.verifyManageOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (otpStore[email] && otpStore[email] === otp) {
      delete otpStore[email]; // Clear OTP after use
      const bookings = await Booking.find({ email }).sort({ date: 1 });
      res.json({ success: true, bookings });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Customer Cancels Booking (Modified: Handles Reason)
exports.customerCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, reason } = req.body; // NOW ACCEPTS REASON

    const booking = await Booking.findOneAndDelete({ _id: id, email });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or access denied' });
    }

    // Email to Admin with Reason
    const adminBody = `
      <h2 style="color: #dc2626;">Booking Cancelled by Customer</h2>
      <p><strong>Customer:</strong> ${booking.firstName} ${booking.lastName}</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin-top: 15px; color: #991b1b;">
        <strong>Reason for Cancellation:</strong><br/>
        ${reason || "No reason provided."}
      </div>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `ACTION REQUIRED: Booking Cancelled - ${booking.firstName}`,
        html: generateEmailTemplate('Cancellation Alert', adminBody)
    });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 8. Customer Updates Booking
exports.customerUpdateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailVerification, ...updateData } = req.body;

    // Security: Only allow update if the email matches the record
    const booking = await Booking.findOneAndUpdate(
      { _id: id, email: emailVerification }, 
      { $set: updateData },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or access denied' });
    }

    const adminBody = `
      <h2 style="color: #f59e0b;">Booking Updated by Customer</h2>
      <p>The customer has modified their booking details.</p>
      <p><strong>Customer:</strong> ${booking.firstName} ${booking.lastName}</p>
      <p><strong>New Service:</strong> ${booking.serviceName}</p>
      <p><strong>New Date:</strong> ${booking.date}</p>
      <p>Please check your dashboard for full updated details.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Booking Updated: ${booking.firstName}`,
      html: generateEmailTemplate('Update Alert', adminBody)
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};