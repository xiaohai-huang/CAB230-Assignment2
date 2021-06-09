module.exports = (requiredFields) => (req, res, next) => {
  console.log("in middle ware");
  const sortedRequiredFields = requiredFields.sort();
  const sortedRealBody = Object.keys(req.body).sort();
  for (let i = 0; i < sortedRequiredFields.length; i++) {
    const field = sortedRequiredFields[i];
    if (field !== sortedRealBody[i]) {
      res.status(400).json({
        error: true,
        message: `Request body incomplete, ${requiredFields.join(
          ", "
        )} are required`,
      });
      return;
    }
  }
  next();
};
