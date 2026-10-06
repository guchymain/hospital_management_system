const { z } = require("zod")
const { name, email, phone, atLeastOneField } = require("./common")
const { password, role } = require("./auth")

const createUserSchema = z.object({
  name,
  email,
  phone,
  password,
  role: role.optional().default("receptionist")
}).strict()

const updateUserSchema = atLeastOneField(
  z.object({
    name,
    email,
    phone,
    password: password.optional(),
    role: role.optional()
  })
)

module.exports = { createUserSchema, updateUserSchema }
