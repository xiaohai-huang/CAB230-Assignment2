const jwt = require("jsonwebtoken");
module.exports = (strict) => (req, res, next) => {
  const { authorization } = req.headers;
  if (!strict && !authorization) {
    req.authenticated = false;
    next();
    return;
  }
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
        const { exp, email } = jwt.verify(token, process.env.SECRET_KEY);

        // TokenExpired
        if (exp < Date.now()) {
          res.status(401).json({
            error: true,
            message: "JWT token has expired",
          });
          return;
        } else {
          req.authenticated = true;
          req.email = email;
          next();
          return;
        }
      } catch (e) {
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
