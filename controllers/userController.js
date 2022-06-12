const mongoose = require("mongoose");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");
const APIFeatures = require("../utils/ApiFeatures");
const factory = require("./handleFactory");

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query)
        .filter().sort().limitFields().paginate();
    const users = await features.query;

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    const { id } = req.user;
    // console.log(id);
    const user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        data: user
    })
});

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError("no user found with that id", 404));
    }

    res.status(200).json({
        status: "success",
        data: user
    })
});
