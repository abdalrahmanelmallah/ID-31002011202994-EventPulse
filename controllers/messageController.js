const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email")
      .populate("event", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
