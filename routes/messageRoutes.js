const router = require("express").Router();
const { getMessages } = require("../controllers/messageController");

router.get("/", getMessages);

module.exports = router;
