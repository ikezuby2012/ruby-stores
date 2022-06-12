const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/ApiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");
const factory = require("./handleFactory");

exports.getAllCart = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Cart.find().populate("drug").populate("user"), req.query).filter().sort().limitFields().paginate();
    const carts = await features.query;

    res.status(200).json({
        status: 'success',
        results: carts.length,
        data: carts
    });
})

exports.addToCart = catchAsync(
    async (req, res, next) => {
        const { product, quantity } = req.body;
        const { id } = req.user;
        let newCart;
        //check if drug is present in cart with the id or name
        const checkProduct = await Cart.find(
            {
                user: id,
                product
            }
        );
        // console.log(checkDrug);
        //if present, increase the quality of the drug in cart
        if (checkProduct.length !== 0) {
            await Cart.updateOne({ product: product, user: id }, { $inc: { quality: 1 } });
        }
        // console.log(newCart);
        //if not present, add to cart
        const _product = await Product.findById(product);
        const price = _product.price;
        
        if (checkProduct.length === 0) {
            newCart = await Cart.create({
                // _id: id,
                user: id,
                product,
                quantity,
                total: quantity * price
            });
        }

        res.status(201).json({
            status: "success",
            data: newCart
        });
    }
)

exports.getCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
        return next(new AppError("no cart found with that id", 404));
    }

    res.status(200).json({
        status: "success",
        data: cart
    })
});

exports.getCartByUserId = catchAsync(
    async (req, res, next) => {
        const { id } = req.params;
        const data = await Cart.aggregate([
            {
                $match: {
                    "user": mongoose.Types.ObjectId(id)
                }
            },
            {
                $sort: {
                    created_at: -1
                }
            }
        ]);
        await Cart.populate(data, {
            path: "product",
            // select: "name email country"
        });

        if (!data) {
            return next(new AppError("could not fetch data!", 401));
        }

        res.status(200).json({
            status: "success",
            data
        })
    }
)
exports.createNewCart = factory.createOne(Cart);
exports.deleteCart = factory.deleteOne(Cart);