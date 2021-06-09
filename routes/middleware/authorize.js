const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  let token = null;
  // Retrieve token
  if (authorization) {
    // Authorization header is malformed
    if (authorization.split(" ").length !== 2) {
      res.status(401).json({
        error: true,
        message: "Authorization header is malformed",
      });
      return;
    }
    const [token_type, token] = authorization.split(" ");
    if (token_type === "Bearer") {
      // Verify JWT and check expiration date
      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // TokenExpired
        if (decoded.exp < Date.now()) {
          res.status(401).json({
            error: true,
            message: "JWT token has expired",
          });
          return;
        } else {
          next();
          return;
        }
      } catch (e) {
        console.log(e);
        // InvalidJWT
        res.status(401).json({
          error: true,
          message: "Invalid JWT token",
        });
        return;
      }
    }
  }
  // MissingAuthHeader
  res.status(401).json({
    error: true,
    message: "Authorization header ('Bearer token') not found",
  });
};
