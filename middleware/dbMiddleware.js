const options = require("../database/knexfile.js");
const knex = require("knex")(options);

module.exports = (req, res, next) => {
  req.db = knex;
  next();
};
