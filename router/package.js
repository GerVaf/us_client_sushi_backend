const express = require("express");
const {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} = require("../controller/package_controller");
const { verifyToken, checkRole } = require("../middleware/checking_middleware");


const router = express.Router();


// Public route: Get all packages (accessible to everyone)
router.route("/").get(getPackages);

// Protected route: Create a package (accessible only to admins)
router.route("/").post(verifyToken, checkRole("admin"), createPackage);

// Protected routes: Get, update, or delete a package by ID (admins only for update and delete)
router
  .route("/:id")
  .get(verifyToken, getPackageById) // Protected: Only authenticated users can get a package by ID
  .put(verifyToken, checkRole("admin"), updatePackage) // Protected: Only admins can update a package
  .delete(verifyToken, checkRole("admin"), deletePackage); // Protected: Only admins can delete a package

module.exports = router;
