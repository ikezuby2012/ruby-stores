const Contact = require("../models/contactModel");
const APIFeatures = require("../utils/ApiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/CatchAsync");
const factory = require("./handleFactory");

exports.createNewContact = factory.createOne(Contact);
exports.deleteContact = factory.deleteOne(Contact);
exports.getAllContacts = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Contact.find(), req.query).filter().sort().limitFields().paginate();
    const contacts = await features.query;

    res.status(200).json({
        status: 'success',
        results: carts.length,
        data: contacts
    });
})