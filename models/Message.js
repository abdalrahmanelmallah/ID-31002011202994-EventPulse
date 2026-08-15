const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"]
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"]
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
