const User = require("../models/user");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcrypt");

// Create a new user (Admin only)
exports.createUser = tryCatch(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate that all fields are provided
  if (!username || !email || !password || !role) {
    return sendResponse(res, 400, null, "All fields are required.");
  }

  // Check if the email already exists
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return sendResponse(res, 400, null, `Email "${email}" is already in use.`);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
  });

  // Save the user to the database
  await newUser.save();

  // Prepare the response
  const responseUser = {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  };

  return sendResponse(res, 201, responseUser, "User created successfully!");
});

// Get all users (Admin only)
exports.getUsers = tryCatch(async (req, res) => {
  console.log(req)
  const users = await User.find().select("-password").lean();
  return sendResponse(res, 200, users);
});

// Get a single user by ID (Admin only)
exports.getUserById = tryCatch(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();
  if (!user) {
    return sendResponse(res, 404, null, "User not found.");
  }

  return sendResponse(res, 200, user);
});

// Update a user by ID (Admin only)
exports.updateUser = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  // Check if the user exists
  const user = await User.findById(id);
  if (!user) {
    return sendResponse(res, 404, null, "User not found.");
  }

  // Update the user fields
  user.username = username || user.username;
  user.email = email || user.email;
  user.role = role || user.role;

  // Save the updated user to the database
  await user.save();

  // Prepare the response
  const responseUser = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return sendResponse(res, 200, responseUser, "User updated successfully!");
});

// Delete a user by ID (Admin only)
exports.deleteUser = tryCatch(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id).lean();
  if (!user) {
    return sendResponse(res, 404, null, "User not found.");
  }

  return sendResponse(res, 204, null, "User deleted successfully!");
});
