var express = require("express");
var router = express.Router();

const validateYear = (year) => {
  if (!/[0-9]{4}/.test(year)) {
    throw new Error("Invalid year format. Format must be yyyy");
  } else {
    return true;
  }
};
/**
 * Does not include 0
 * @param {string} str
 * @returns
 */
function isNormalInteger(str) {
  var n = Math.floor(Number(str));
  return parseInt(str, 10) === Number(str) && n > 0;
}

const purify = (json) => JSON.parse(JSON.stringify(json));
/**
 *  Returns a list of countries and their happiness rank
 *  for the years 2015 to 2020. The list is arranged by year,
 *  in descending order. The list can optionally be filtered
 *  by year and/or country name using query parameters.
 */
router.get("/rankings", (req, res) => {
  const { year, country } = req.query;

  // only accepts year and country
  const VALID_QUERY_PARAMS = ["year", "country"];
  // InvalidParametersRankings
  for (const param in req.query) {
    if (!VALID_QUERY_PARAMS.includes(param)) {
      res.status(400).json({
        error: true,
        message:
          "Invalid query parameters. Only year and country are permitted.",
      });
      return;
    }
  }

  // InValidYearFormat
  if (year) {
    try {
      validateYear(year);
    } catch (err) {
      res.status(400).json({
        error: true,
        message: err.message,
      });
      return;
    }
  }
  //InvalidCountryFormat - I have asked tutor Michael,
  // this really means only accept letters, space and ( )
  if (country && !/^[a-zA-Z\s\(\)]+$/.test(country)) {
    console.log("invalid country");
    res.status(400).json({
      error: true,
      message:
        "Invalid country format. Country query parameter cannot contain numbers.",
    });
    return;
  }

  // query the db
  req
    .db("rankings")
    .select("rank", "country", "score", "year")
    .where(purify({ year, country }))
    .then((rows) => {
      res.status(200).json(rows);
    });
});

/**
 * Returns a list of all surveyed countries, ordered alphabetically.
 */
router.get("/countries", (req, res) => {
  // No Query Parameters
  if (Object.keys(req.query).length !== 0) {
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Query parameters are not permitted.",
    });
    return;
  }
  req.db
    .from("rankings")
    .distinct()
    .select("country")
    .orderBy("country", "asc")
    .then((rows) => {
      res.status(200).json(rows.map((row) => row.country));
    });
});

/**
 * Returns a list of countries and their associated happiness factor scores for the specified year.
 * The path parameter (year) is required.
 * The number of returned results can be limited by the optional limit query parameter.
 * A result for a single country can be obtained via the optional country query parameter.
 * This route also requires the user to be authenticated - a valid JWT token must be
 * sent in the header of the request.
 */
router.get("/factors/:year", async (req, res) => {
  const year = req.params.year;
  const { limit, country } = req.query;
  // TODO: token validation

  // InvalidYearFormat
  if (year) {
    try {
      validateYear(year);
    } catch (err) {
      res.status(400).json({
        error: true,
        message: err.message,
      });
      return;
    }
  }
  // optional limit, country
  // validate limit
  if (!isNormalInteger(limit)) {
    res.status(400).json({
      error: true,
      message: "Invalid limit query. Limit must be a positive number.",
    });
    return;
  }
  const COLUMNS = [
    "rank",
    "country",
    "score",
    "economy",
    "family",
    "health",
    "freedom",
    "generosity",
    "trust",
  ];

  const rows = await req.db
    .from("rankings")
    .select(...COLUMNS)
    .where(purify({ year, country }))
    .limit(limit);

  res.status(200).json(rows);
});

router.get("/factors", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not found!",
  });
});

module.exports = router;
