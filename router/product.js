const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/product_controller");
const { verifyToken, checkRole } = require("../middleware/checking_middleware");


const router = express.Router();

// Define routes for CRUD operations
router.route("/").get(getProducts).post(createProduct);

router
  .route("/:id")
  .get(verifyToken, checkRole("admin"), getProductById)
  .put(verifyToken, checkRole("admin"), updateProduct)
  .delete(verifyToken, checkRole("admin"), deleteProduct);

module.exports = router;
