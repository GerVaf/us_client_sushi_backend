const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  generateOtp,
  verifyOtp,
} = require("../controller/user_controller");
const { verifyToken, checkRole } = require("../middleware/checking_middleware");

const router = express.Router();

// Create a new user
router.route("/").post(verifyToken, checkRole("admin"), createUser);

// Get all users
router.route("/").get(verifyToken, checkRole("admin"), getUsers);

// Get, update, or delete a user by ID
router
  .route("/:id")
  .get(verifyToken, checkRole("admin"), getUserById)
  .put(verifyToken, checkRole("admin"), updateUser)
  .delete(verifyToken, checkRole("admin"), deleteUser);

router.route("/generate-otp").post(generateOtp);
router.route("/verify-otp").post(verifyOtp);

module.exports = router;
