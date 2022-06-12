const mongoose = require("mongoose");
const Order = require("../models/orderModel");

const APIFeatures = require("../utils/ApiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");
const factory = require("./handleFactory");

exports.getAllOrders = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Order.find().populate("product").populate("user"), req.query).filter().sort().limitFields().paginate();
    const orders = await features.query;

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
})

exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError("no order found with that id", 404));
    }

    res.status(200).json({
        status: "success",
        data: order
    })
});

exports.createOrder = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { product, quantity, delivery_type, status, amount } = req.body;

    const newOrder = await Order.create({
        user: id,
        product,
        quantity,
        delivery_type,
        status,
        amount
    });

    res.status(201).json({
        status: "success",
        data: newOrder
    })
});
exports.getOrderByUserId = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const orders = await Order.find(
        {
            "user": mongoose.Types.ObjectId(id)
        }
    ).populate("product").populate("user");

    if (!orders) {
        return next(new AppError("could not fetch any orders!", 401));
    }

    res.status(200).json({
        status: "success",
        orders
    });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        status: "successful",
        data: order
    });
});

exports.deleteOrder = factory.deleteOne(Order);