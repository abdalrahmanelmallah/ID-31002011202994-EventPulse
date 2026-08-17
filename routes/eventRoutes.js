const router = require("express").Router();
const { body, param } = require("express-validator");

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");

// Public
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin only
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required"),

    body("category")
      .isMongoId()
      .withMessage("Category must be a valid MongoDB ID"),

    body("date")
      .isISO8601()
      .withMessage("Date must be a valid date"),

    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be a positive number")
  ],
  validate,
  createEvent
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  [
    param("id")
      .isMongoId()
      .withMessage("Event ID must be a valid MongoDB ID"),

    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),

    body("category")
      .optional()
      .isMongoId()
      .withMessage("Category must be a valid MongoDB ID"),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid date"),

    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Capacity must be a positive number")
  ],
  validate,
  updateEvent
);

router.delete("/:id", requireAuth, requireRole("admin"), deleteEvent);

module.exports = router;