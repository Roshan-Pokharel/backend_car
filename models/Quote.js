const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  suburb: { type: String, required: true },
  vehicleReg: { type: String, required: true },
  
  // Storing the service choices
  serviceType: { 
    type: String, 
    required: true,
    enum: ['headlight', 'tinting', 'wrap'] // Optional: Validate specific values
  },
  repairPart: { type: String }, // Can be empty if service is 'wrap'
  tintCondition: { type: String }, // New field for tint condition
  
  // Contact details
  fullName: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true },
  comments: { type: String },
  mailingList: { type: Boolean, default: false },
  cost: { type: Number },
  status: { type: String, default: 'Pending' },

  // Automatically add createdAt and updatedAt timestamps
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);