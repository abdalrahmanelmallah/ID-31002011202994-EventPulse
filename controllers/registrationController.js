const Registration = require("../models/Registration");
const Event = require("../models/Event");

// POST /api/registrations
exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { event: eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const existing = await Registration.findOne({
      user: userId,
      event: eventId,
      status: "registered"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // Atomically reserve one capacity slot. This prevents concurrent
    // requests from pushing registrations above the event capacity.
    const reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ["$registrationCount", "$capacity"] }
      },
      { $inc: { registrationCount: 1 } },
      { new: true }
    );

    if (!reservedEvent) {
      return res.status(400).json({
        success: false,
        message: "This event is full"
      });
    }

    try {
      const registration = await Registration.create({
        user: userId,
        event: eventId,
        status: "registered"
      });

      const populatedRegistration = await Registration.findById(
        registration._id
      )
        .populate("event")
        .populate("user", "name email");

      res.status(201).json({
        success: true,
        message: "Registration created successfully",
        data: populatedRegistration
      });
    } catch (error) {
      // Release the reserved slot if the registration failed (including
      // a concurrent duplicate registration caught by the unique index).
      await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: -1 } });

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "You are already registered for this event"
        });
      }

      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user.id,
      status: "registered"
    })
      .populate("event")
      .populate("user", "name email");

    res.status(200).json({
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

// GET /api/registrations
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

// DELETE /api/registrations/:id
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    if (registration.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own registration"
      });
    }

    registration.status = "cancelled";
    await registration.save();

    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registrationCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};