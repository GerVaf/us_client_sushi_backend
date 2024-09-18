const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/product_controller");
const { verifyToken, checkRole } = require("../middleware/checking_middleware");
const upload = require("../middleware/file_upload");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    verifyToken,
    checkRole("admin"),
    upload.single("productImg"),
    createProduct
  );

router
  .route("/:id")
  .get(verifyToken, checkRole("admin"), getProductById)
  .put(
    verifyToken,
    checkRole("admin"),
    upload.single("productImg"),
    updateProduct
  )
  .delete(verifyToken, checkRole("admin"), deleteProduct);

module.exports = router;
