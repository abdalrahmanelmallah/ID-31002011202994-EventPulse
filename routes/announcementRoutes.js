const router = require("express").Router();

const {
  createAnnouncement,
  getAnnouncements
} = require("../controllers/announcementController");

const { body } = require("express-validator");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Public — announcement history
router.get("/:eventId", getAnnouncements);

// Admin only — create and broadcast announcement
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("eventId")
      .isMongoId()
      .withMessage("eventId must be a valid MongoDB ID"),
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Text is required")
      .isLength({ max: 1000 })
      .withMessage("Text cannot exceed 1000 characters")
  ],
  validate,
  createAnnouncement
);

module.exports = router;
