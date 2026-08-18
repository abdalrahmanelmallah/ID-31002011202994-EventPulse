const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const Registration = require("./models/Registration");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Identify the socket's user from a JWT passed in the handshake
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    // Allow anonymous connections; they just won't be able to join rooms
    return next();
  }

  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Ignore bad token — treat as anonymous rather than rejecting the connection
  }

  next();
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Attendee joins the room for an event they're registered for.
  // Admins can join any event room to send announcements.
  socket.on("joinEvent", async (eventId, callback) => {
    try {
      if (!socket.user) {
        return callback?.({ success: false, message: "Authentication required" });
      }

      if (socket.user.role === "admin") {
        socket.join(eventId);
        return callback?.({ success: true });
      }

      const registration = await Registration.findOne({
        user: socket.user.id,
        event: eventId,
        status: "registered"
      });

      if (!registration) {
        return callback?.({
          success: false,
          message: "You must be registered for this event to join its room"
        });
      }

      socket.join(eventId);
      callback?.({ success: true });
    } catch (err) {
      callback?.({ success: false, message: err.message });
    }
  });

  socket.on("leaveEvent", (eventId) => {
    socket.leave(eventId);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);

async function start() {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`EventPulse API (with Socket.io) running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, httpServer, io };
