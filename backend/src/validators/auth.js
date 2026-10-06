const { z } = require("zod")
const { name, email, phone } = require("./common")

const password = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  })
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must not exceed 64 characters")

const role = z
  .enum(["admin", "doctor", "nurse", "receptionist"], {
    errorMap: () => ({ message: "Role must be admin, doctor, nurse, or receptionist" })
  })

const registerSchema = z.object({
  name,
  email,
  phone,
  password,
  role: role.optional().default("receptionist")
}).strict()

const loginSchema = z.object({
  email,
  password: z.string({ required_error: "Password is required" }).min(1, "Password cannot be empty")
}).strict()

module.exports = { registerSchema, loginSchema, password, role }
