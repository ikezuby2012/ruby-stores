const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();

const productRoute = require("./routes/productRoutes");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./controllers/errorController");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const contactRoute = require("./routes/contactRoute");

//cors
app.use(cors());
app.options("*", cors());
//<-- body parser parsing data to the backend
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
//data sanitisation against xss attacks
app.use(xss());
// data sanitization against noSql query injection
app.use(mongoSanitize());

app.use(compression());

//<-- serving static files
app.use(express.static(`${__dirname}/public`));

//<-- limit request from the same api
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP, please try again in an hour"
});
app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use("/images", express.static('resources'));

app.use("/api/v1/stores", productRoute);
app.use(`/api/v1/user`, userRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/contact", contactRoute);

//ping if api is working
app.get("/", (req, res) => {
    res.send("server is working! \n try out other routes");
})

//SERVE CLIENT ROUTES
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
//ROUTE HANDLER NOT SPECIFIED 
app.all("*", (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;