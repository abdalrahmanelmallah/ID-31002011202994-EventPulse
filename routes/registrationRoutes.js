const router = require("express").Router();
const { body } = require("express-validator");

const {
  registerForEvent,
  getMyRegistrations,
  getRegistrations,
  cancelRegistration
} = require("../controllers/registrationController");

const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");

// Register for an event
router.post(
  "/",
  requireAuth,
  [
    body("event")
      .isMongoId()
      .withMessage("Event must be a valid MongoDB ID")
  ],
  validate,
  registerForEvent
);

// My registrations
router.get("/my", requireAuth, getMyRegistrations);

// Admin/all registrations
router.get("/", requireAuth, getRegistrations);

// Cancel registration
router.delete("/:id", requireAuth, cancelRegistration);

module.exports = router;