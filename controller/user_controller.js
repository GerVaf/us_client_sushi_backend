const User = require("../models/user");
const Order = require("../models/order");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Create a new user (Admin only)
exports.createUser = tryCatch(async (req, res) => {
  const { username, email, password, role, isVerified } = req.body;

  console.log(isVerified);

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
    isVerified: isVerified ? isVerified : false,
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const startIndex = (page - 1) * limit;

  const totalUsers = await User.countDocuments({ _id: { $ne: req.userId } });

  const users = await User.find({ _id: { $ne: req.userId } })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .lean();

  // Fetch all orders for each user
  const usersWithOrders = await Promise.all(
    users.map(async (user) => {
      const orders = await Order.find({ user: user._id })
        .sort({ orderDate: -1 })
        .select("items totalAmount progress orderDate")
        .lean();

      return {
        ...user,
        orders: orders || [], // Include all orders or an empty array if no orders exist
      };
    })
  );

  const totalPages = Math.ceil(totalUsers / limit);

  return sendResponse(res, 200, {
    users: usersWithOrders,
    table: {
      currentPage: page,
      totalPages,
      pageLimit: limit,
      totalUsers,
    },
  });
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

const GenerateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
  return otp.toString();
};

// Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

exports.generateOtp = tryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, null, "User not found");
  }

  const otpValue = GenerateOtp();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otpValue, salt);

  // Set OTP hash and expiration time (30 minutes from now)
  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // Current time + 30 minutes
  await user.save();

  // Email options
  const mailOptions = {
    from: {
      name: "Sushi world",
      address: "vixxgrego@gmail.com",
    },
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otpValue}. It is valid for 30 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent: %s", info.messageId);
    return sendResponse(
      res,
      201,
      null,
      "OTP code sent. Please check your email."
    );
  } catch (error) {
    console.error("Email send error: ", error);
    return sendResponse(res, 500, null, "Failed to send OTP email");
  }
});

// Verify OTP with expiration check
exports.verifyOtp = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, null, "User not found");
  }

  // Check if the OTP has expired
  if (new Date() > user.otpExpiresAt) {
    return sendResponse(res, 400, null, "OTP has expired");
  }

  const isMatch = await bcrypt.compare(otp, user.otpHash);
  if (!isMatch) {
    return sendResponse(res, 400, null, "Invalid OTP");
  }

  user.isVerified = true;
  user.otpHash = null;
  user.otpExpiresAt = null;
  await user.save();

  return sendResponse(res, 200, null, "OTP verified successfully");
});
