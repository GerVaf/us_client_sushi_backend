const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  progress: {
    type: String,
    enum: ["pending", "accepted", "declined", "done"],
    default: "pending",
  },
  phoneNumber: { type: String, required: true }, // Add phoneNumber field
  whereToSend: { type: String, required: true }, // Add whereToSend field
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
