const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  serviceType: { type: String, required: true }, // e.g., 'tint'
  serviceName: { type: String, required: true }, // e.g., 'Window Tinting'
  selectedShade: { type: String }, // e.g., '35%' for tint service
  selectedCoverage: { type: String }, // e.g., 'Full' or 'Partial' for tint service
  selectedHeadlights: { type: String }, // e.g., 'both' or 'single' for restoration service
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  date: { type: String, required: true }, // Keeping as string to match input type="date"
  status: { type: String, default: 'Pending' }, // internal tracking
  mailingList: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);