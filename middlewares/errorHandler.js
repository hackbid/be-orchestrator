const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err.name == "notSaldo") {
    res.status(400).json({ message: "add your balance" });
  }
  const { status, data } = err.response;
  res.status(status).json(data);
};

module.exports = errorHandler;
