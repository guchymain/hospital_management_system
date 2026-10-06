const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body"
    })
  }

  // Handle Sequelize validation or unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: err.errors && err.errors[0] ? err.errors[0].message : "A record with this unique field already exists"
    })
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Referenced record does not exist or violates relational constraint"
    })
  }

  const statusCode = err.statusCode || err.status || 500
  const isSafe = err.isOperational || (err.expose && statusCode < 500)

  if (!isSafe && process.env.NODE_ENV !== "test") {
    console.error(err.stack || err)
  }

  res.status(statusCode).json({
    success: false,
    message: isSafe ? err.message : "Internal server error"
  })
}

module.exports = errorHandler
