const crypto = require("crypto");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");

const signToken = (id) => 
    jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    const token = signToken(newUser._id);

    const cookieOptions = {
        expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES *24 *60*60*1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    newUser.password = undefined;
    
    res.status(200).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req,res,next) => {
    const {email, password} = req.body;
    // check if email and password exist
    if (!email || !password) {
        return next(new AppError("please provide an email and password", 400));
    } 
    //check if user exist and password is correct
    const user = await User.findOne({email: email}).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("incorrect email or password!",401));
    }

    //send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(Date.now + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success"});
});

exports.protect = catchAsync(async (req,res,next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookie.jwt){
        token = req.cookie.jwt;
    }
    if (!token) {
        return next(new AppError("you are not logged in! log in to gain access", 401))
    }
    //validate the token
    const decoded = promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exist
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError("the token belonging to the user does not exist", 401));
    }

    //check if user changed password after the token was issue
    if (!currentUser.changePassword(decoded.iat)) {
        return next(new AppError("user password was recently changed! please log in again", 401));
    }
    //grant access to the protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.forgetPassword = catchAsync(async (req,res,next) => {
    //get user based on posted email
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError("there is no user with that email", 404));
    }
    //get the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
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

exports.updatePassword = catchAsync(async (req,res,next) => {

});