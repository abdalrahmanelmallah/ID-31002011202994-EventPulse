const router = require("express").Router();

const {
  createAnnouncement,
  getAnnouncements
} = require("../controllers/announcementController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Public — announcement history
router.get("/:eventId", getAnnouncements);

// Admin only — create and broadcast announcement
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  createAnnouncement
);

module.exports = router;
