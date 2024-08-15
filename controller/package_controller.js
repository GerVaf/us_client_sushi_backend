const Package = require("../models/package");
const { tryCatch } = require("../utils/try_catch");
const { sendResponse } = require("../utils/response");
const { isValidObjectId } = require("../utils/is_valid_id");
const Product = require("../models/product");

// Create a new Package
exports.createPackage = tryCatch(async (req, res) => {
  const { name, price, include } = req.body;

  // Check if a Package with the same name already exists
  const existingPackage = await Package.findOne({ name }).lean();
  if (existingPackage) {
    return sendResponse(
      res,
      400,
      null,
      `Package with name "${name}" already exists.`
    );
  }

  // Validate product IDs and check if they are already included in any package
  const validProductIds = [];
  const products = await Product.find({ _id: { $in: include } }).lean();

  if (products.length !== include.length) {
    return sendResponse(
      res,
      400,
      null,
      "Some product IDs are invalid or do not exist."
    );
  }

  for (const product of products) {
    const packageWithProduct = await Package.findOne({
      include: product._id,
    }).lean();
    if (packageWithProduct) {
      return sendResponse(
        res,
        400,
        null,
        `Product with ID "${product._id}" is already included in another package.`
      );
    }
    validProductIds.push(product._id);
  }

  // Create the new Package
  const newPackage = new Package({ name, price, include: validProductIds });
  await newPackage.save();

  // Populate the include field with product names
  await newPackage.populate({ path: "include", select: "name -_id" });

  // Return the package with product names only
  const responsePackage = {
    name: newPackage.name,
    price: newPackage.price,
    include: newPackage.include.map((item) => item.name),
  };

  return sendResponse(res, 201, responsePackage);
});

// Get all Packages
exports.getPackages = tryCatch(async (req, res) => {
  const packages = await Package.find()
    .populate({
      path: "include",
      select: "name price description -_id",
    })
    .lean();

  return sendResponse(res, 200, packages);
});

// Get a single Package by ID
exports.getPackageById = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Validate the package ID
  if (!isValidObjectId(res, id)) return;

  const package = await Package.findById(id)
    .populate({
      path: "include",
      select: "name price description -_id",
    })
    .lean();

  // Handle case where Package is not found
  if (!package) {
    return sendResponse(res, 404, null, `Package not found for ID: ${id}`);
  }

  return sendResponse(res, 200, package);
});

// Update a Package by ID
exports.updatePackage = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, price, include } = req.body;

  // Validate the package ID
  if (!(await isValidObjectId(res, id, Package, "Package ID"))) return;

  // Validate product IDs (if provided)
  const validProductIds = [];
  if (include && Array.isArray(include)) {
    const products = await Product.find({ _id: { $in: include } }).lean();

    if (products.length !== include.length) {
      return sendResponse(
        res,
        400,
        null,
        "Some product IDs are invalid or do not exist."
      );
    }

    validProductIds.push(...products.map((product) => product._id));
  }

  // Update the package
  const updatedPackage = await Package.findByIdAndUpdate(
    id,
    {
      name,
      price,
      include: validProductIds.length > 0 ? validProductIds : undefined,
    },
    { new: true }
  )
    .populate({
      path: "include",
      select: "name price description -_id",
    })
    .lean();

  if (!updatedPackage) {
    return sendResponse(res, 404, null, `Package not found for ID: ${id}`);
  }

  return sendResponse(res, 200, updatedPackage);
});

// Delete a Package by ID
exports.deletePackage = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Validate the package ID
  if (!isValidObjectId(res, id)) return;

  const package = await Package.findByIdAndDelete(id).lean();

  if (!package) {
    return sendResponse(res, 404, null, "Package not found");
  }

  return sendResponse(res, 204, null, "Package deleted successfully!");
});
