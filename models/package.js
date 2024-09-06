const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the Package model
const packageSchema = new Schema({
  name: {
    type: String,
    required: true, // Name of the package (e.g., "Family Size")
  },
  price: {
    type: Number,
    required: true, // Total price for the package
  },
  include: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Package model using the schema
const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
