const mongoose = require("mongoose");
const { sendResponse } = require("./response");

exports.isValidObjectId = (res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendResponse(res, 400, null, `Invalid ID format: ${id}`);
    return false;
  }
  return true;
};
