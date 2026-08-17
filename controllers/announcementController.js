const Message = require("../models/Message");
const Event = require("../models/Event");

exports.createAnnouncement = async (req, res) => {
  try {
    const { eventId, text } = req.body;

    if (!eventId || !text) {
      return res.status(400).json({
        success: false,
        message: "eventId and text are required"
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const message = await Message.create({
      event: eventId,
      sender: req.user.id,
      content: text
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email");

    const io = req.app.get("io");

    io.to(eventId).emit("announcement", populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const messages = await Message.find({
      event: req.params.eventId
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};