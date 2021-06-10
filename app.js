require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const database = require("./middleware/dbMiddleware");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user");
const swaggerRouter = require("./routes/docs");
const app = express();

app.use(logger("common"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(database);

app.use("/", indexRouter);
app.use("/user", usersRouter);

app.use(swaggerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(404).json({ error: "Page Not Found" + JSON.stringify(err) });
});

module.exports = app;
