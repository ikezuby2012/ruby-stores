const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "user must have a name"],
    },
    email: {
        type: String,
        required: [true, "please provide your email address!"],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, "please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "please provide a password!"],
        minLength: [8, "password must have at least 8 characters"],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "please confirm your password!"],
        minLength: [8, "password must have at least 8 characters"],
        validate: {
            validator: function (el) {
                // we must return an expression either true or false
                //this only work on save();
                return el === this.password;
            },
            message: "passwords are not the same!"
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

UserSchema.pre("save", async function (next) {
    // only run this function if password is not modified
    if (!this.isModified('password')) return next();
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now - 1000; // token may be created before timeStamp so we subtract 1s
    next();
});

UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changePassword = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changeTS, JWTTimestamp)

        return JWTTimestamp < changeTS;
    }
    // false means not changed
    return false;
};

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = model("User", UserSchema);
module.exports = User;