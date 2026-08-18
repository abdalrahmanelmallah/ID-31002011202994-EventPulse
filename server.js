require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-event", (eventId) => {
    socket.join(eventId);
    console.log(
      `Socket ${socket.id} joined event room ${eventId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(
        `EventPulse server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();