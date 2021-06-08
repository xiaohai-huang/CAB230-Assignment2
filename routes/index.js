var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({ cao: "22", sb: "666" });
});

module.exports = router;
