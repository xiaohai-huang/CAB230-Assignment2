module.exports = (requiredFields) => (req, res, next) => {
  const sortedRequiredFields = [...requiredFields].sort();
  const sortedRealBody = Object.keys(req.body).sort();

  for (let i = 0; i < sortedRequiredFields.length; i++) {
    const field = sortedRequiredFields[i];
    if (field !== sortedRealBody[i]) {
      const temp = [...requiredFields];
      const last = temp.pop();
      const fields = temp.join(", ") + " and " + last;
      res.status(400).json({
        error: true,
        message: `Request body incomplete: ${fields} are required.`,
      });
      return;
    }
  }
  next();
};
