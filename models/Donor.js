const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  age: { 
    type: Number, 
    required: true,
    min: 18,
    max: 65 
  },   
  gender: { 
    type: String, 
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  contactNumber: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  lastDonationDate: { 
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Method to check if donor is eligible to donate
donorSchema.methods.isEligibleToDonate = function() {
  if (!this.lastDonationDate) return true;
  
  const today = new Date();
  const daysSinceLastDonation = (today - this.lastDonationDate) / (1000 * 60 * 60 * 24);
  return daysSinceLastDonation >= 56; // 8 weeks minimum gap
};

module.exports = mongoose.model('Donor', donorSchema);