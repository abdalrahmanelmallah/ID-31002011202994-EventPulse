const router = require("express").Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Public
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin only
router.post("/", requireAuth, requireRole("admin"), createEvent);
router.patch("/:id", requireAuth, requireRole("admin"), updateEvent);
router.delete("/:id", requireAuth, requireRole("admin"), deleteEvent);

module.exports = router;