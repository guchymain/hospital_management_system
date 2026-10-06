const logger = (req, res, next) => {
  const timestamp = new Date().toISOString()

  res.on("finish", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode}`
      )
    }
  })

  next()
}

module.exports = logger
