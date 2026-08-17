const router = require("express").Router();

const {
  registerForEvent,
  getMyRegistrations,
  getRegistrations,
  cancelRegistration
} = require("../controllers/registrationController");

const requireAuth = require("../middleware/requireAuth");

// Register for an event
router.post("/", requireAuth, registerForEvent);

// My registrations
router.get("/my", requireAuth, getMyRegistrations);

// Admin/all registrations
router.get("/", requireAuth, getRegistrations);

//cancel registration
router.delete("/:id", requireAuth, cancelRegistration);

module.exports = router;