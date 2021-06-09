require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const database = require("./database/dbMiddleware");
const swaggerUI = require("swagger-ui-express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerDocument = require("./docs/swagger.json");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user");

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
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/knex", async function (req, res, next) {
  const result = await req.db
    .raw("SELECT VERSION()")
    .then((version) => JSON.stringify(version[0][0]));

  res.send("Version Logged successfully" + result);
});

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
  res.status(500).json({ error: "Server Error!" + JSON.stringify(err) });
});

module.exports = app;
