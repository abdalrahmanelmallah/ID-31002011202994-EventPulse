const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Event title must be at least 3 characters"]
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true
    },
    registrationCount: {
      type: Number,
      default: 0,
      min: 0
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"]
    },
    date: {
      type: Date,
      required: [true, "Event date is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

eventSchema.index({
  title: "text",
  description: "text"
});

module.exports = mongoose.model("Event", eventSchema);
