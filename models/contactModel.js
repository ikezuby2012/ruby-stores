const mongoose = require("mongoose");
const validator = require("validator");
const { Schema, model } = mongoose;

const contactSchema = new Schema({
    email: {
        type: String,
        required: [true, "please provide your email address!"],
        // unique: true,
        lowerCase: true,
        validate: [validator.isEmail, "please provide a valid email"]
    },
    message: {
        type: String,
        trim: true,
        required: [true, "message is required"],
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = model("Contact", contactSchema);