require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(mongoSanitize());

// Socket.io
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-event", (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event room ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventPulse API is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    database: "connected"
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`EventPulse server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();