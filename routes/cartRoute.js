const express = require("express");
const { protect, restrictUser } = require("../controllers/authControllers");
const {
    getAllCart, addToCart, createNewCart, deleteCart, getCart, getCartByUserId
} = require("../controllers/cartController");
// const { callback, toProtect } = require("../controllers/googleAuth");
const router = express.Router();

router.use(protect);
router.route("/")
    .post(addToCart)
    .get(getAllCart);

router.route("/:id")
    .get(getCart)
    .delete(deleteCart);
    
router.get("/user/:id", getCartByUserId);

module.exports = router;
