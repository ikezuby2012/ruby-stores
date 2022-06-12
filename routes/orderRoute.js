const express = require("express");
const { protect, restrictUser } = require("../controllers/authControllers");
const { getOrder, createOrder, getAllOrders, getOrderByUserId } =
    require("../controllers/orderController");
const router = express.Router();

router.use(protect);
router.route("/").post(createOrder).get(getAllOrders);
router.route("/:id").get(getOrder);

router.get("/user/:id", getOrderByUserId);
module.exports = router