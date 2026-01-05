// controllers/hitController.js
const HitCounter = require('../models/HitCounter');

exports.trackHit = async (req, res) => {
  try {
    // Get the IP address from the request
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // 1. Find the counter document
    let counter = await HitCounter.findOne({ id: 'site_hits' });

    // 2. If it doesn't exist, create it
    if (!counter) {
      counter = await HitCounter.create({ 
        id: 'site_hits', 
        count: 1, 
        ips: [clientIp] 
      });
    } else {
      // 3. Check if IP is unique
      if (!counter.ips.includes(clientIp)) {
        counter.ips.push(clientIp);
        counter.count += 1;
        await counter.save();
      }
    }

    res.status(200).json({
      success: true,
      count: counter.count
    });
  } catch (error) {
    console.error('Hit Counter Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};