const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true })
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), quiet: true })
require("dotenv").config()

const dialectOptions = {}
if (process.env.DB_SSL === "true" || process.env.DB_SSL === "require") {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  }
}

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  schema: process.env.DB_SCHEMA,
  searchPath: process.env.DB_SCHEMA,
  logging: process.env.NODE_ENV === "test" ? false : false,
  dialectOptions
}

module.exports = {
  development: config,
  test: config,
  production: config
}
