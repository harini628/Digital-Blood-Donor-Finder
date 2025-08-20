const express = require('express');
const Donor = require('../models/Donor');
const router = express.Router();

// Add Donor
router.post("/", async (req, res) => {
  try {
    // Check if donor already exists
    const existingDonor = await Donor.findOne({ 
      $or: [{ email: req.body.email }, { contactNumber: req.body.contactNumber }] 
    });

    if (existingDonor) {
      return res.status(400).json({ 
        success: false,
        message: "Donor with this email or contact number already exists" 
      });
    }

    const donor = new Donor(req.body);
    await donor.save();
    
    res.status(201).json({
      success: true,
      message: "Donor registered successfully!",
      data: donor
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: "Error saving donor", 
      error: err.message 
    });
  }
});

// Get All Donors
router.get("/", async (req, res) => {
  try {
    const donors = await Donor.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching donors", 
      error: err.message 
    });
  }
});

// Search Donors
router.get("/search", async (req, res) => {
  try {
    const { bloodGroup, age, location, available } = req.query;
    let query = { isActive: true };

    // Filter by blood group
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // Filter by age range (±5 years)
    if (age) {
      const ageNum = parseInt(age);
      query.age = { $gte: ageNum - 5, $lte: ageNum + 5 };
    }

    // Filter by location (case-insensitive)
    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    let donors = await Donor.find(query).sort({ createdAt: -1 });

    // Filter by availability if requested
    if (available === 'true') {
      donors = donors.filter(donor => donor.isEligibleToDonate());
    }

    // Add eligibility status to each donor
    const donorsWithEligibility = donors.map(donor => ({
      ...donor.toObject(),
      isEligible: donor.isEligibleToDonate(),
      daysSinceLastDonation: donor.lastDonationDate 
        ? Math.floor((new Date() - donor.lastDonationDate) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({
      success: true,
      count: donorsWithEligibility.length,
      data: donorsWithEligibility,
      filters: { bloodGroup, age, location, available }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Error searching donors", 
      error: err.message 
    });
  }
});

// 🗑️ Delete Donor (Soft Delete)
router.delete("/:id", async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found"
      });
    }

    res.json({
      success: true,
      message: "Donor removed successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error removing donor",
      error: err.message
    });
  }
});


module.exports = router;
