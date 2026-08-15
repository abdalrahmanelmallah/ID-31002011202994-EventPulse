const router = require("express").Router();

const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Public
router.get("/", getEvents);

// Admin only
router.post("/", requireAuth, requireRole("admin"), createEvent);
router.put("/:id", requireAuth, requireRole("admin"), updateEvent);
router.delete("/:id", requireAuth, requireRole("admin"), deleteEvent);

module.exports = router;