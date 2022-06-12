const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

exports.signup = catchAsync(async (req, res, next) => {
    //we need to specify a special route for creating administrative user
    //to prevent malicious user from becoming admin

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        // role: req.body.role,
    });

    const token = signToken(newUser._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        // secure: true, // only works on https 
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    newUser.password = undefined;

    res.status(201).json({
        status: "success",
        token,
        user: newUser
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password exist
    if (!email || !password) {
        return next(new AppError("please provide an email and password", 400));
    }
    //check if user exist and password is correct
    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("incorrect email or password!", 401));
    }

    //send token to client
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;

    res.status(200).json({
        status: "success",
        token,
        user
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(Date.now + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success" });
});

exports.protect = catchAsync(async (req, res, next) => {
    //getting the token and checking if it exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    //console.log(token);
    if (!token) {
        return next(new AppError("you are not logged In!, log in to gain access", 403));
    }

    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user exist
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
        return next(new AppError("the user belonging to this token does not exist!", 403))
    }

    //check if user changed password after the token was issued
    if (freshUser.changePassword(decoded.iat)) {
        return next(new AppError("user recently changed password, please log in again", 401))
    }
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("there is no user with that email", 404));
    }
    //get the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //<-- send it back as an email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    // const message =
    //     `forget your password? submit a patch request with your new password and passwordConfirm to ${resetURL}.\n
    // if you didn't forget your password, please ignore this email`;

    res.status(201).json({
        status: "success",
        message: "token sent to email!"
    });
});

exports.restrictUser = (...roles) => (req, res, next) => {
    const { role } = req.user;
    //console.log(role);
    if (roles.includes(role)) {
        return next(new AppError("you don't have permission to perform this operation", 403));
    }
    next();
}

exports.createAdminUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { role: "admin" });

    res.status(200).json({
        status: "success",
        data: user
    })
});

exports.updatePassword = catchAsync(async (req, res, next) => {

});