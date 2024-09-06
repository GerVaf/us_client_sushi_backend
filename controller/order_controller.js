const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const Package = require("../models/package");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const { isValidObjectId } = require("../utils/is_valid_id");

// Create a new Order
exports.createOrder = tryCatch(async (req, res) => {
  const { items, phoneNumber, whereToSend } = req.body;
  const { userId } = req;

  if (!phoneNumber || !whereToSend) {
    return sendResponse(
      res,
      400,
      null,
      "Phone number and delivery address are required."
    );
  }

  const existingOrder = await Order.findOne({
    user: userId,
    progress: { $in: ["pending", "accepted"] },
  });

  if (existingOrder) {
    return sendResponse(
      res,
      400,
      null,
      "You already have an order that is pending or accepted. Please be patient or contact us."
    );
  }

  let totalAmount = 0;

  for (let item of items) {
    if (item.product) {
      const validation = await isValidObjectId(item.product, Product);
      if (!validation.valid) {
        return sendResponse(res, 400, null, validation.message);
      }

      const product = await Product.findById(item.product).lean();
      totalAmount += product.price * item.quantity;
    } else if (item.package) {
      const validation = await isValidObjectId(item.package, Package);
      if (!validation.valid) {
        return sendResponse(res, 400, null, validation.message);
      }

      const package = await Package.findById(item.package).lean();
      totalAmount += package.price * item.quantity;
    } else {
      return sendResponse(
        res,
        400,
        null,
        "Each item must include either a valid product or package ID."
      );
    }
  }

  const order = new Order({
    user: userId,
    items: items,
    totalAmount: totalAmount,
    phoneNumber: phoneNumber,
    whereToSend: whereToSend,
  });

  await order.save();
  return sendResponse(res, 201, order);
});

// Get all Orders (for admins)
exports.getOrder = tryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();

  const orders = await Order.find()
    .populate("user", "username email -_id")
    .populate("items.product", "name price")
    .populate("items.package", "name price")
    .sort({ orderDate: -1 })
    .skip(startIndex)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalOrders / limit);

  return sendResponse(res, 200, {
    orders,
    table: {
      currentPage: page,
      totalPages,
      pageLimit: limit,
      totalOrders,
    },
  });
});

// Get Orders by User ID (for admins)
exports.getOrderByUserId = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Validate if the provided ID is a valid ObjectId
  const validation = await isValidObjectId(id, User);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  const orders = await Order.find({ user: id })
    .populate("items.product items.package")
    .populate("user", "username email -_id")
    .lean();

  if (!orders.length) {
    return sendResponse(res, 404, null, `No orders found for user ID: ${id}`);
  }

  return sendResponse(res, 200, orders);
});

// Update an Order (for admins)
exports.updateOrder = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const progressData = ["pending", "accepted", "declined", "done"];

  if (!progressData.some((pro) => pro === progress)) {
    return sendResponse(res, 400, null, "progress does not match!");
  }
  // Validate the order ID
  const validation = await isValidObjectId(id, Order);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  // Update the progress field only
  const order = await Order.findByIdAndUpdate(
    id,
    { progress },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!order) {
    return sendResponse(res, 404, null, `Order not found for ID: ${id}`);
  }

  return sendResponse(res, 200, order);
});

// Delete an Order (for admins)
exports.deleteOrder = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Validate if the provided ID is a valid ObjectId
  const validation = await isValidObjectId(id, Order);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  const order = await Order.findByIdAndDelete(id).lean();

  if (!order) {
    return sendResponse(res, 404, null, "Order not found");
  }

  return sendResponse(res, 200, null, "Order deleted successfully.");
});
