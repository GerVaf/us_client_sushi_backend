const express = require("express");
const {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} = require("../controller/package_controller");
const { verifyToken, checkRole } = require("../middleware/checking_middleware");
const upload = require("../middleware/file_upload");

const router = express.Router();

router.route("/").get(getPackages);

router
  .route("/")
  .post(
    verifyToken,
    checkRole("admin"),
    upload.array("packageImages"),
    createPackage
  );

router
  .route("/:id")
  .get(verifyToken, getPackageById)
  .put(
    verifyToken,
    checkRole("admin"),
    upload.array("packageImages"),
    updatePackage
  )
  .delete(verifyToken, checkRole("admin"), deletePackage);

module.exports = router;
