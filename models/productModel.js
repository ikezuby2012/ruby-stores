const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "a product must have a name"],
        trim: true,
        unique: true,
        minLength: [1, "a product name must have more than 1 character"]
    },
    price: {
        type: Number,
        required: [true, "a product must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: "discount price ({VALUE}) should be lower than regular price"
        }
    },
    category: {
        type: String,
        trim: true,
        required: [true, "a product must have a category"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, "a product must have a description"]
    },
    imageCover: {
        type: String,
        required: [true, "a product must have an image"]
    },
    images: [String],
    ratingsAverage: {
        type: Number,
        default: 2.5,
        min: [1, "rating must be above 1.0"],
        max: [5, "rating must be less than or equal to 5.0"],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuality: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Product = model("Product", productSchema);
module.exports = Product;