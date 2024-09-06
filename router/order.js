const express = require("express");
const {
  getOrder,
  createOrder,
  getOrderByUserId,
  updateOrder,
  deleteOrder,
} = require("../controller/order_controller");
const {
  verifyToken,
  checkRole,
  fetchOrdersByUserId,
} = require("../middleware/checking_middleware");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, checkRole("admin"), getOrder)
  .post(verifyToken, checkRole("user"), createOrder);

router
  .route("/:id")
  .get(verifyToken, checkRole("admin"), getOrderByUserId)
  .put(verifyToken, checkRole("admin"), updateOrder)
  .delete(verifyToken, checkRole("admin"), deleteOrder);

router
  .route("/user/history")
  .get(verifyToken, fetchOrdersByUserId, (req, res) => {
    res.json(req.orders);
  });

module.exports = router;
