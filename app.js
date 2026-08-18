require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(mongoSanitize());

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Health check
app.get("/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected"
    });
  } catch (error) {
    console.error("Health check database error:", error.message);

    res.status(500).json({
      status: "error",
      environment: process.env.NODE_ENV || "development",
      database: "disconnected"
    });
  }
});

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventPulse API is running"
  });
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use(
  "/api/registrations",
  require("./routes/registrationRoutes")
);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use(
  "/api/announcements",
  require("./routes/announcementRoutes")
);

// 404 handler
app.use((req, res, next) => {
  const AppError = require("./utils/AppError");
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Central error handler must be registered last.
app.use(require("./middleware/errorHandler"));

module.exports = app;
