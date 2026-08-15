const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
}

module.exports = connectDB;
