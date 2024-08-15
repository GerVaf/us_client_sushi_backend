const express = require("express");
const {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} = require("../controller/package_controller");

const router = express.Router();

// Define routes for CRUD operations
router.route("/").get(getPackages).post(createPackage);

router
  .route("/:id")
  .get(getPackageById)
  .put(updatePackage)
  .delete(deletePackage);

module.exports = router;
