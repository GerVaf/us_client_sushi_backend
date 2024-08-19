const mongoose = require("mongoose");

exports.isValidObjectId = async (id, model) => {
  // Check if the ID format is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { valid: false, message: `Invalid ID format: ${id}` };
  }

  // Check if the ID exists in the specified collection
  if (model) {
    const document = await model.findById(id);
    if (!document) {
      return { valid: false, message: `ID not found: ${id}` };
    }
  }

  return { valid: true };
};
