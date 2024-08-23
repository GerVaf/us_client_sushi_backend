const { sendResponse } = require("../utils/response");

exports.checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return sendResponse(
        res,
        403,
        null,
        "Access denied. Insufficient permissions."
      );
    }
    next();
  };
};
