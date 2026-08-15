require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const Message = require("./models/Message");

async function seed() {
  try {
    await connectDB();

    const admin = await User.findOneAndUpdate(
      { email: "admin@eventpulse.com" },
      {
        name: "EventPulse Admin",
        email: "admin@eventpulse.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin"
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const categoryData = [
      { name: "Music", description: "Concerts and live music events" },
      { name: "Tech", description: "Technology and developer events" },
      { name: "Sports", description: "Sports and fitness events" }
    ];

    const categories = {};
    for (const item of categoryData) {
      const category = await Category.findOneAndUpdate(
        { name: item.name },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categories[item.name] = category;
    }

    const eventData = [
      {
        title: "Summer Music Festival",
        description: "A live music festival featuring local artists.",
        capacity: 500,
        date: new Date("2026-09-20T18:00:00Z"),
        city: "Cairo",
        category: categories.Music._id,
        createdBy: admin._id
      },
      {
        title: "Future Tech Conference",
        description: "Talks and workshops about modern software development.",
        capacity: 300,
        date: new Date("2026-10-10T10:00:00Z"),
        city: "Alexandria",
        category: categories.Tech._id,
        createdBy: admin._id
      },
      {
        title: "Community Football Day",
        description: "A friendly football event for the local community.",
        capacity: 100,
        date: new Date("2026-11-05T15:00:00Z"),
        city: "Mansoura",
        category: categories.Sports._id,
        createdBy: admin._id
      }
    ];

    for (const item of eventData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    await Registration.deleteMany({});
    await Message.deleteMany({});

    console.log("Seed completed successfully.");
    console.log("Admin login:");
    console.log("Email: admin@eventpulse.com");
    console.log("Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
