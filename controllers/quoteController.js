const Quote = require('../models/Quote');
const transporter = require('../services/mailing'); // Ensure this path points to your mailing.js

// @desc    Create new quote
// @route   POST /api/quotes
exports.createQuote = async (req, res) => {
  try {
    const {
      suburb,
      vehicleReg,
      serviceType,
      repairPart,
      tintCondition,
      fullName,
      phone,
      email,
      comments
    } = req.body;

    // 1. Create the document in MongoDB
    const quote = await Quote.create({
      suburb,
      vehicleReg,
      serviceType,
      repairPart,
      tintCondition,
      fullName,
      phone,
      email,
      comments
    });

    // --- EMAIL TEMPLATE STYLES ---
    const styles = {
      container: `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 8px;`,
      header: `background-color: #003366; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;`,
      content: `background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`,
      table: `width: 100%; border-collapse: collapse; margin-top: 20px;`,
      th: `text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; color: #495057; font-size: 14px;`,
      td: `padding: 12px; border-bottom: 1px solid #dee2e6; color: #212529; font-size: 14px;`,
      footer: `text-align: center; font-size: 12px; color: #888888; margin-top: 20px;`
    };

    // 2. Prepare Email for Admin (Detailed Report)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Quote Request: ${serviceType.toUpperCase()} - ${fullName}`,
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h2 style="margin: 0;">New Quote Request</h2>
            <p style="margin: 5px 0 0; opacity: 0.9;">${new Date().toLocaleString()}</p>
          </div>
          <div style="${styles.content}">
            <p><strong>You have received a new inquiry from the website.</strong></p>
            
            <table style="${styles.table}">
              <tr><th style="${styles.th}">Field</th><th style="${styles.th}">Details</th></tr>
              <tr><td style="${styles.td}"><strong>Customer Name</strong></td><td style="${styles.td}">${fullName}</td></tr>
              <tr><td style="${styles.td}"><strong>Email</strong></td><td style="${styles.td}"><a href="mailto:${email}" style="color: #003366;">${email}</a></td></tr>
              <tr><td style="${styles.td}"><strong>Phone</strong></td><td style="${styles.td}"><a href="tel:${phone}" style="color: #003366;">${phone || 'Not Provided'}</a></td></tr>
              <tr><td style="${styles.td}"><strong>Suburb</strong></td><td style="${styles.td}">${suburb}</td></tr>
              <tr><td style="${styles.td}"><strong>Vehicle Reg</strong></td><td style="${styles.td}" style="text-transform: uppercase;">${vehicleReg}</td></tr>
              <tr><td style="${styles.td}"><strong>Service Type</strong></td><td style="${styles.td}">${serviceType}</td></tr>
              
              ${repairPart ? `<tr><td style="${styles.td}"><strong>Repair Part</strong></td><td style="${styles.td}">${repairPart}</td></tr>` : ''}
              
              ${tintCondition ? `<tr><td style="${styles.td}"><strong>Tint Condition</strong></td><td style="${styles.td}">${tintCondition}</td></tr>` : ''}
            </table>

            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #003366; margin-top: 20px;">
              <p style="margin: 0 0 5px; font-weight: bold; color: #555;">Customer Comments:</p>
              <p style="margin: 0; color: #333; font-style: italic;">"${comments || 'No comments provided.'}"</p>
            </div>
          </div>
          <div style="${styles.footer}">
             <p>System Auto-Generated Email</p>
          </div>
        </div>
      `
    };

    // 3. Prepare Email for User (Professional Acknowledgement)
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Quote Request Received',
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h2 style="margin: 0;">Quote Request Received</h2>
          </div>
          <div style="${styles.content}">
            <h3 style="color: #333; margin-top: 0;">Hi ${fullName},</h3>
            <p style="line-height: 1.6; color: #555;">
              Thank you for contacting us. We have successfully received your quote request for <strong>${serviceType}</strong> on your vehicle (Reg: ${vehicleReg}).
            </p>
            <p style="line-height: 1.6; color: #555;">
              Our team is currently reviewing your details. We aim to get back to you with a competitive quote or further questions shortly.
            </p>
            
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0; color: #333;">Best regards,</p>
              <p style="margin: 5px 0 0; font-weight: bold; color: #003366;">The Team</p>
            </div>
          </div>
          <div style="${styles.footer}">
             <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // 4. Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    // 5. Send Response
    res.status(201).json({
      success: true,
      message: 'Quote submitted and emails sent successfully',
      data: quote
    });

  } catch (error) {
    console.error('Submission Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Validation failed'
    });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteQuote = async (req, res) => { 
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.addCostAndSendEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { cost } = req.body;

        if (!cost) {
            return res.status(400).json({ success: false, message: 'Cost is required' });
        }

        // 1. Update Quote in DB
        const quote = await Quote.findByIdAndUpdate(
            id, 
            { cost: cost, status: 'Quoted' }, 
            { new: true }
        );

        if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

        // 2. Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: quote.email,
            subject: 'Your Service Quote Estimation',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Quote for ${quote.serviceType} Service</h2>
                    <p>Hi ${quote.fullName},</p>
                    <p>Thank you for your inquiry regarding your <strong>${quote.vehicleReg}</strong>.</p>
                    
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin:0; color: #333;">Estimated Cost: $${cost}</h3>
                    </div>

                    <p><strong>Service Details:</strong><br/>
                    Type: ${quote.serviceType}<br/>
                    ${quote.repairPart ? `Repair Part: ${quote.repairPart}<br/>` : ''}
                    ${quote.tintCondition ? `Tint Condition: ${quote.tintCondition}<br/>` : ''}
                    </p>

                    <p>To proceed with this booking, please reply to this email or call us.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, data: quote, message: 'Quote sent successfully!' });

    } catch (error) {
        console.error('Error sending quote:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};