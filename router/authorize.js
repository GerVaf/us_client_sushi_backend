const express = require("express");
const { signup, login } = require("../controller/authorize_controller");

const router = express.Router();

// Define routes for authentication operations
router.route("/signup").post(signup);
router.route("/login").post(login);

module.exports = router;
