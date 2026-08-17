module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    status = "fail";
    message = "Invalid ID format";
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    status = "fail";
    message = "Duplicate value already exists";
  }

  res.status(statusCode).json({
    success: false,
    status,
    message
  });
};
