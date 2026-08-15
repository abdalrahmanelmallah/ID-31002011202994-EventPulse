const router = require("express").Router();
const { getRegistrations } = require("../controllers/registrationController");

router.get("/", getRegistrations);

module.exports = router;
