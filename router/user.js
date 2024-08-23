const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controller/user_controller");
const { checkRole } = require("../middleware/role_check");
const { verifyToken } = require("../middleware/vertify_token");

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

module.exports = router;
