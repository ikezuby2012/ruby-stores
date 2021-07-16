
const Product = require("../models/productModel");
const ApiFeatures = require("../utils/ApiFeatures");
const catchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/AppError");

exports.getCheapTopFiveProduct = (req,res,next) => {
    req.query.limit = "7";
    req.query.sort = "price";
   next();
};

exports.getPopularProducts = (req, res, next) => {
    req.query.limit = "7";
    req.query.sort = "-ratingsAverage,price";
    next();
}

exports.getAllProducts = catchAsync( async(req,res,next) => {
    const features = new ApiFeatures(Product.find(), req.query).filter().sort().limitFields().paginate();
    const products = await features.query;

    res.status(200).json({
        status: "success",
        results: products.length,
        data: {
            products
        }
    })
});

exports.createProduct = catchAsync( async(req, res, next) => {
    const newProduct = await Product.create(req.body);

    res.status(201).json({
       status: "success",
       data: {
           product: newProduct
       }
    });
});

exports.getProduct = catchAsync( async(req, res,next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError("no product found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            product
        }

    })
});

exports.updateProduct = catchAsync(async (req, res,next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        status: "success",
        data: {
            product
        }
    });
});

exports.deleteProduct = catchAsync( async(req, res,next) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
        data: null
    })
});


//get product with same category
exports.getCategory = catchAsync( async (req, res,next) => {
    const category = req.params.category;

    const products = await Product.aggregate([
        {
            $match: {category: {$eq: category}}
        }
    ]);

    res.status(201).json({
        status: "success",
        data: {
            products
        }
    });
});