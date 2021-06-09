const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const requiredBody = require("./middleware/requiredBody");
const authorize = require("./middleware/authorize");

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
      return;
    }
    // password shouldn't be empty
    if (!password) {
      res.status(400).json({
        error: true,
        message: "Password shouldn't be empty.",
      });
      return;
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

router.post("/login", requiredBody(["email", "password"]), async (req, res) => {
  // 1. Retrieve email and password from req.body
  const { email, password } = req.body;
  if (!password) {
    res.status(400).json({
      error: true,
      message: "Password shouldn't be empty.",
    });
    return;
  }
  // 2. Determine if user already exists in table
  const queryUser = (await req.db.from("user").select("*").where({ email }))[0];
  // 2.1 If user does exist, verify if passwords match
  if (queryUser) {
    const match = await bcrypt.compare(password, queryUser.hash);
    // 2.1.1 If passwords match, return JWT token
    if (match) {
      // Create and return JWT token
      const secretKey = process.env.SECRET_KEY;
      const expires_in = 60 * 60 * 24; // 1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.status(200).json({
        token,
        token_type: "Bearer",
        expires_in,
      });
    }
    // 2.1.2 If passwords do no match, return error response
    else {
      res.status(401).json({
        error: true,
        message: "Incorrect email or password",
      });
    }
  }
  // 2.2 If user does not exist, return error response
  else {
    // I know user does not exist
    // Try to prevent from being hacked
    res.status(401).json({
      error: true,
      message: "Incorrect email or password",
    });
  }
});

// profile
router.get("/:email/profile", authorize(false), async (req, res) => {
  const { email } = req.params;
  if (!email || !validateEmail(email)) {
    res.status(400).json({
      error: true,
      message: "Email is required",
    });
    return;
  }
  const profile = (await req.db.from("user").select("*").where({ email }))[0];
  if (!profile) {
    res.status(404).json({
      error: true,
      message: "User not found",
    });
    return;
  }
  // AuthenticatedProfile && user itself?
  if (req.authenticated && email === req.email) {
    res.status(200).json({
      email: profile.email ? profile.email : null,
      firstName: profile.firstName ? profile.firstName : null,
      lastName: profile.lastName ? profile.lastName : null,
      dob: profile.dob ? profile.dob : null,
      address: profile.address ? profile.address : null,
    });
    return;
  }
  // PublicProfile
  else {
    res.status(200).json({
      email: profile.email ? profile.email : null,
      firstName: profile.firstName ? profile.firstName : null,
      lastName: profile.lastName ? profile.lastName : null,
    });
    return;
  }
});

router.put(
  "/:email/profile",
  authorize(true),
  requiredBody(["firstName", "lastName", "dob", "address"]),
  async (req, res) => {
    const { email } = req.params;
    const { firstName, lastName, dob, address } = req.body;
    console.log({ firstName, lastName, dob, address });
    // Forbidden. Email address associated with JWT token is not the same as email provided in path parameter.
    if (req.email !== email) {
      res.status(403).json({
        error: true,
        message: "Forbidden",
      });
      return;
    }
    // InvalidFirstNameLastNameAddressFormat

    // InvalidProfileDateFormat

    // InvalidProfileDate

    // Perform the update
    await req.db
      .from("user")
      .where({ email })
      .update({ firstName, lastName, dob, address });
    const updatedUser = (
      await req.db.from("user").select("*").where({ email })
    )[0];
    res.status(200).json(updatedUser);
  }
);

module.exports = router;
