const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    product: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    delivery_type: {
        type: String,
        enum: ["home delivery", "pickup"],
        default: "home delivery"
    },
    amount: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now()
    }

}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name email role country"
    })
        .populate("product");
    // this.total = this.drug.price * quality;
    next();
});

module.exports = model("Order", orderSchema);