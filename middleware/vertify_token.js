const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendResponse } = require("../utils/response");

exports.verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return sendResponse(res, 401, null, "Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Optionally, you can load the user and attach it to req object
    req.user = await User.findById(req.userId).select("-password").lean();

    next();
  } catch (error) {
    return sendResponse(res, 400, null, "Invalid token.");
  }
};
