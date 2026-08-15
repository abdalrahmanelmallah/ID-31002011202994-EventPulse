const Registration = require("../models/Registration");

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user", "name email")
      .populate("event", "title date city");

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
