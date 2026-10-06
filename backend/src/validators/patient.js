const { z } = require("zod")
const { name, email, phone, atLeastOneField } = require("./common")

const dateOfBirth = z
  .string({
    required_error: "Date of birth is required",
    invalid_type_error: "Date of birth must be a valid date string (YYYY-MM-DD)"
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")

const gender = z.enum(["male", "female", "other"], {
  errorMap: () => ({ message: "Gender must be male, female, or other" })
})

const address = z
  .string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a string"
  })
  .trim()
  .min(3, "Address must be at least 3 characters")
  .max(500, "Address must not exceed 500 characters")

const createPatientSchema = z.object({
  name,
  dateOfBirth,
  gender,
  phone,
  email,
  address
}).strict()

const updatePatientSchema = atLeastOneField(
  z.object({
    name: name.optional(),
    dateOfBirth: dateOfBirth.optional(),
    gender: gender.optional(),
    phone: phone.optional(),
    email: email.optional(),
    address: address.optional()
  })
)

module.exports = { createPatientSchema, updatePatientSchema }
