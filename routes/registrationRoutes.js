const router = require("express").Router();

const {
  getRegistrations,
  registerForEvent
} = require("../controllers/registrationController");

const requireAuth = require("../middleware/requireAuth");

// Register for an event — logged-in users only
router.post("/", requireAuth, registerForEvent);

// Existing route
router.get("/", getRegistrations);

module.exports = router;