const errorMiddleware = (err, req, res, next) => {
  console.log("errorMiddleware-->", err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    message: message,
  });
};
module.exports = errorMiddleware;
