const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const packageSchema = new Schema({
  name: {
    type: String,
    required: true, 
  },
  price: {
    type: String,
    required: true, 
  },
  image: {
    type: String,
  },
  include: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product", 
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
