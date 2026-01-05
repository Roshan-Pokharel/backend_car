// models/HitCounter.js
const mongoose = require('mongoose');

const HitCounterSchema = new mongoose.Schema({
  id: { type: String, default: 'site_hits' }, 
  count: { type: Number, default: 0 },
  // Store unique IP addresses to prevent duplicate counts
  ips: [String] 
});

module.exports = mongoose.model('HitCounter', HitCounterSchema);