const Product = require("../models/product");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const { isValidObjectId } = require("../utils/is_valid_id");
const Package = require("../models/package");

// Create a new Product
exports.createProduct = tryCatch(async (req, res) => {
  const { name, price, description } = req.body;

  // Check if a product with the same name already exists
  const existingProduct = await Product.findOne({ name }).lean();
  if (existingProduct) {
    return sendResponse(
      res,
      400,
      null,
      `Product with name "${name}" already exists.`
    );
  }

  // If no product with the same name exists, create the new product
  const product = new Product({ name, price, description });
  await product.save();
  return sendResponse(res, 201, product);
});

// Get all Products
exports.getProducts = tryCatch(async (req, res) => {
  const products = await Product.find().lean();
  return sendResponse(res, 200, products);
});

// Get a single Product by ID
exports.getProductById = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Use the reusable function to validate the ID
  const validation = await isValidObjectId(id, Product);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  const product = await Product.findById(id).lean();

  // Handle case where product is not found
  if (!product) {
    return sendResponse(res, 404, null, `Product not found for ID: ${id}`);
  }

  return sendResponse(res, 200, product);
});

exports.updateProduct = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  // Use the reusable function to validate the ID
  const validation = await isValidObjectId(id, Product);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { name, price, description },
    { new: true, runValidators: true } // Return the updated document
  ).lean();

  if (!product) {
    return sendResponse(res, 404, null, "Product not found");
  }

  return sendResponse(res, 200, product);
});

exports.deleteProduct = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Use the reusable function to validate the ID
  const validation = await isValidObjectId(id, Product);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  const product = await Product.findByIdAndDelete(id).lean();

  if (!product) {
    return sendResponse(res, 404, null, "Product not found");
  }

  // Remove the product ID from all packages that include it
  await Package.updateMany({ include: id }, { $pull: { include: id } });

  return sendResponse(
    res,
    200,
    null,
    "Product deleted and removed from all associated packages."
  );
});
