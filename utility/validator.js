const validateYear = (year) => {
  if (!/^[0-9]{4}$/.test(year)) {
    throw new Error("Invalid year format. Format must be yyyy");
  } else {
    return true;
  }
};
const validateCountry = (country) => /^[a-zA-Z\s\(\)]+$/.test(country);
/**
 * Does not include 0
 * @param {string} str
 * @returns true if the input string is a positive integer
 */
const isNormalInteger = (str) => {
  var n = Math.floor(Number(str));
  return parseInt(str, 10) === Number(str) && n > 0;
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validateStringOnly(str) {
  return typeof str === "string";
}

module.exports = {
  validateCountry,
  validateYear,
  isNormalInteger,
  validateEmail,
  validateStringOnly,
};
