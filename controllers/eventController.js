const Event = require("../models/Event");

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("category")
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      capacity,
      date,
      city,
      category
    } = req.body;

    const event = await Event.create({
      title,
      description,
      capacity,
      date,
      city,
      category,
      createdBy: req.user.id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("category")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: populatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("category")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};