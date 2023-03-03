const errorHandler = (err, req, res, next) => {
    if (err) {
        res.status(500).json(err);
    }
    next();
};

module.exports = errorHandler;
