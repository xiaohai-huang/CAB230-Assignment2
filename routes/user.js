const express = require("express");
const router = express.Router();

const requiredBody = require("./middleware/requiredBody");

router.post(
  "/register",
  requiredBody(["email", "password"]),
  function (req, res) {
    console.log("in register");
    res.send("respond with a resource");
  }
);

module.exports = router;
