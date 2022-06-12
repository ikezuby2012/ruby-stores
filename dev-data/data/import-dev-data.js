const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("../../models/productModel");

dotenv.config({
    path: "./config.env"
});

mongoose.connect(process.env.DATABASE_ATLAS, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
}).then(() => {
    console.log("database connected");
});

//READ JSON FILE
const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, "utf-8"));

//import data to database
const importData = async () => {
    try {
        await Product.create(products);
        console.log("DB loaded successfully");
    } catch (err) {
        console.log(err)
    }
    process.exit(1);
};

const deleteData = async () => {
    try {
        await Product.deleteMany();
    } catch (err) {
        console.log(err);
    }
    process.exit(1);
};

if (process.argv[2] === "--import") {
    importData();
}
if (process.argv[2] === "--delete") {
    deleteData();
}
console.log(process.argv);