let bcrypt
try {
  bcrypt = require("bcrypt")
  // Verify it works
  bcrypt.hashSync("test", 1)
} catch {
  bcrypt = require("bcryptjs")
}

module.exports = bcrypt
