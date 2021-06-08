var express = require("express");
var router = express.Router();

/**
 *  Returns a list of countries and their happiness rank
 *  for the years 2015 to 2020. The list is arranged by year,
 *  in descending order. The list can optionally be filtered
 *  by year and/or country name using query parameters.
 */
router.get("/rankings", (req, res) => {
  const { year, country } = req.query;
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
  console.log(JSON.stringify(req.query));
  // InValidYearFormat
  if (year && !/[0-9]{4}/.test(year)) {
    res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy",
    });
    return;
  }
  //InvalidCountryFormat
  else if (country && !/^[a-zA-Z\s]+$/.test(country)) {
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
    .where(JSON.parse(JSON.stringify({ year, country })))
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

module.exports = router;
