const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const requiredBody = require("./middleware/requiredBody");

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
router.post(
  "/register",
  requiredBody(["email", "password"]),
  async (req, res) => {
    // 1. Retrieve email and password from req.body
    const { email, password } = req.body;
    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        error: true,
        message: "Email is in a incorrect format.",
      });
    }
    // 2. Determine if user already exists in table
    const queryUsers = await req.db.from("user").select("*").where({ email });
    // 2.1 If user does not exist, insert into table
    if (queryUsers.length === 0) {
      // Insert user into DB
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      await req.db.from("user").insert({ email, hash });

      res.status(201).json({
        message: "User created",
      });
    }
    // 2.2 if user does exist, return error response
    else {
      res.status(409).json({
        error: true,
        message: "User already exists",
      });
    }
  }
);

module.exports = router;
