const errorHandler = (err, req, res, next) => {
    console.log(err);
    const { status, data } = err.response;
    res.status(status).json(data);
};

module.exports = errorHandler;
