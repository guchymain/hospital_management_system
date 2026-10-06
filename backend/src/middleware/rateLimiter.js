const { rateLimit } = require("express-rate-limit")

const limitReached = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later"
  })
}

// Strict limit for login and register to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached,
  skip: () => process.env.NODE_ENV === "test"
})

// General limit for the rest of the API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached,
  skip: () => process.env.NODE_ENV === "test"
})

module.exports = { authLimiter, apiLimiter }
