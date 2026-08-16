const Registration = require("../models/Registration");
const Event = require("../models/Event");

// POST /api/registrations
exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.body.event;

    // Check that the event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Prevent double registration
    const existing = await Registration.findOne({
      user: userId,
      event: eventId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // Check event capacity
    const currentCount = await Registration.countDocuments({
      event: eventId,
      status: "registered"
    });

    if (currentCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "This event is full"
      });
    }

    // Create registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      status: "registered"
    });

    const populatedRegistration = await Registration.findById(
      registration._id
    )
      .populate("user", "name email")
      .populate("event", "title description capacity date city category");

    res.status(201).json({
      success: true,
      message: "Registration created successfully",
      data: populatedRegistration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Existing endpoint
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};