const errorHandler = (err, req, res, next) => {
  const { status, data } = err.response;
  res.status(status).json(data);
};

module.exports = errorHandler;
