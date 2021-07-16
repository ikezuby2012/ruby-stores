const express = require("express");

const router = express.Router();
const {
    createProduct,getAllProducts, getProduct,updateProduct,deleteProduct, getCategory, 
    getCheapTopFiveProduct, getPopularProducts
} = require("../controllers/productController");

router.route("/top-five-cheap").get(getCheapTopFiveProduct, getAllProducts);
router.route("/getPopularProducts").get(getPopularProducts, getAllProducts);

router.route("/").get(getAllProducts).post(createProduct);
router.route("/:id").get(getProduct).patch(updateProduct).delete(deleteProduct);
router.route("/:category").get(getCategory);


module.exports = router;