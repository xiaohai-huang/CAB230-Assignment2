const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");
const validateQueryParameters = require("../middleware/validateQueryParameters");
const {
  validateYear,
  validateCountry,
  isNormalInteger,
} = require("../utility/validator");

/**
 * Removed undefined in the JSON
 * @param {object} json
 * @returns
 */
const purify = (json) => JSON.parse(JSON.stringify(json));

/**
 *  Returns a list of countries and their happiness rank
 *  for the years 2015 to 2020. The list is arranged by year,
 *  in descending order. The list can optionally be filtered
 *  by year and/or country name using query parameters.
 */
router.get(
  "/rankings",
  validateQueryParameters(["year", "country"]),
  (req, res) => {
    const { year, country } = req.query;

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
    if (country && !validateCountry(country)) {
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
      .orderBy("year", "desc")
      .orderBy("rank", "asc")
      .then((rows) => {
        res
          .status(200)
          .json(rows.map((row) => ({ ...row, score: row.score.toString() })));
      });
  }
);

/**
 * Returns a list of all surveyed countries, ordered alphabetically.
 */
router.get("/countries", validateQueryParameters([]), (req, res) => {
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
router.get(
  "/factors/:year",
  authorize(true),
  validateQueryParameters(["limit", "country"]),
  async (req, res) => {
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
    } else {
      res.status(400).json({
        error: true,
        message: "Year is required",
      });
      return;
    }
    // optional limit, country
    // validate limit
    if (limit && !isNormalInteger(limit)) {
      res.status(400).json({
        error: true,
        message: "Invalid limit query. Limit must be a positive number.",
      });
      return;
    }
    if (country && !validateCountry(country)) {
      res.status(400).json({
        error: true,
        message:
          "Invalid country format. Country query parameter cannot contain numbers.",
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

    res.status(200).json(
      rows.map((row) => {
        return {
          rank: Number(row.rank),
          country: row.country,
          score: Number(row.score).toFixed(3),
          economy: Number(row.economy).toFixed(3),
          family: Number(row.family).toFixed(3),
          health: Number(row.health).toFixed(3),
          freedom: Number(row.freedom).toFixed(3),
          generosity: Number(row.generosity).toFixed(3),
          trust: Number(row.trust).toFixed(3),
        };
      })
    );
  }
);

router.get("/factors", authorize, (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not found!",
  });
});

module.exports = router;
