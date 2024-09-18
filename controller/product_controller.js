const Product = require("../models/product");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const { isValidObjectId } = require("../utils/is_valid_id");
const Package = require("../models/package");

exports.createProduct = tryCatch(async (req, res) => {
  const { name, price, description } = req.body;
  
  console.log(req.body);

  if (!req.file) {
    return sendResponse(res, 400, null, `Item image is required!`);
  }

  
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
  const product = new Product({
    name,
    price,
    description,
    image: `http://localhost:8989/${req.file.path}`, 
  });
  await product.save();

  return sendResponse(res, 201, product, "Product created successfully");
});

exports.getProducts = tryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const startIndex = (page - 1) * limit;

  const totalProducts = await Product.countDocuments();

  const products = await Product.find()
    .skip(startIndex)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalProducts / limit);

  return sendResponse(res, 200, {
    products,
    table: {
      currentPage: page,
      totalPages,
      pageLimit: limit,
      totalProducts,
    },
  });
});

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

  // Validate the object ID
  const validation = await isValidObjectId(id, Product);
  if (!validation.valid) {
    return sendResponse(res, 400, null, validation.message);
  }

  // Prepare update data
  const updateData = {
    name,
    price,
    description,
  };

  // Check if a new image is uploaded
  if (req.file) {
    updateData.image = `http://localhost:8989/${req.file.path}`; // Update with the new image path
  }

  // Update the product
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) {
    return sendResponse(res, 404, null, "Product not found");
  }

  return sendResponse(res, 200, product, "Product updated successfully");
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
