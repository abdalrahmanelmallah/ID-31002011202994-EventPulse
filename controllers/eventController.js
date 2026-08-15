const Event = require("../models/Event");

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("category")
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
