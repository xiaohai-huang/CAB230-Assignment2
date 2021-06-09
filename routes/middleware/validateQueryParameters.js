/**
 * Check if the input query parameters are allowed
 * @param {string[]} allowedParams
 * @param {string[]} realQueryParams
 * @returns true if all of the input query parameters are allowed
 */
const validateParamters = (allowedParams, realQueryParams) => {
  for (const param in realQueryParams) {
    if (!allowedParams.includes(param)) {
      return false;
    }
  }
  return true;
};

module.exports = (validQueryParams) => (req, res, next) => {
  if (!validateParamters(validQueryParams, req.query)) {
    res.status(400).json({
      error: true,
      message:
        validQueryParams.length === 0
          ? "Invalid query parameters. Query parameters are not permitted."
          : `Invalid query parameters. Only ${validQueryParams.join(
              ", "
            )} are permitted.`,
    });
    return;
  } else {
    next();
  }
};
