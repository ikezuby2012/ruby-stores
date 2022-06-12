const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, "must not be less than 1"]
    },
    total: {
        type: Number,
        default: 1,
        min: [1, "must not be less than 1"]
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name email role country"
    })
        .populate("product");
    // this.total = this.drug.price * quality;
    next();
});

// cartSchema.pre(/^find/, function (next) {
//     console.log(this.quality);
//     // this.total = this.drug.price * quality;
//     next();
// })

module.exports = model("Cart", cartSchema);