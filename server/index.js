const express = require("express"); //Faire appel au Package d'expressJs
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const ipRouter=require("./routes/ipRoutes")
const { mongo } = require("mongoose");
const app = express();

// 1) MIDDLEWARE

// Définir une sécurité pour nos entêtes HTTP
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
// data sanitization against NOSQL Query Injection
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());
// Prevent parameter Pollution
app.use(hpp());

app.use(express.static(`${__dirname}/public`));

// LIMITS REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Request From This Ip, please try again",
});
app.use("/api", limiter);

app.use((req, res, next) => {
  req.requestTime = new Date();
  next();
});

// 2) ROUTE HANDLERS

// 3) ROUTES

app.use((req, res, next) => {
  console.log("Hello from middleware");
  next();
});

// app.use("/api/v1/tours", tourRouter);
// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/iproutes", ipRouter);

// Handle Errors+


app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4) SERVER

module.exports = app;
