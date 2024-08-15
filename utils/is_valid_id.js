const mongoose = require("mongoose");
const { sendResponse } = require("./response");

exports.isValidObjectId = async (res, id, model, idName = "ID") => {
  // Check if the ID format is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendResponse(res, 400, null, `Invalid ${idName} format: ${id}`);
    return false;
  }

  // Check if the ID exists in the specified collection
  const document = await model?.findById(id);
  if (!document) {
    sendResponse(res, 404, null, `${idName} not found: ${id}`);
    return false;
  }

  return true;
};
