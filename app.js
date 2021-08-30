const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const xss = require("xss-clean");

const app = express();

const productRoute = require("./routes/productRoutes");
const userRoute = require("./routes/userRoute");

//cors
app.use(cors());
//<-- body parser parsing data to the backend
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
//data sanitisation against xss attacks
app.use(xss());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
app.use("/images", express.static('public'));

app.use("/api/v1/stores", productRoute);
app.use(`/api/v1/user`, userRoute);

require("./controllers/errorController");
module.exports = app;