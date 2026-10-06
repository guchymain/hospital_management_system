// source can be "body", "params", or "query"
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {})

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message
        }))
      })
    }

    if (source === "body") {
      req.body = result.data
    } else if (source === "params") {
      req.params = result.data
    } else if (source === "query") {
      req.query = result.data
    }

    next()
  }
}

module.exports = { validate }
