const { z } = require("zod")
const { name, email, phone, id, atLeastOneField } = require("./common")

const specialization = z
  .string({
    required_error: "Specialization is required",
    invalid_type_error: "Specialization must be a string"
  })
  .trim()
  .min(2, "Specialization must be at least 2 characters")
  .max(100, "Specialization must not exceed 100 characters")

const createDoctorSchema = z.object({
  departmentId: id("Department ID"),
  specialization,
  userId: id("User ID").optional(),
  name: name.optional(),
  email: email.optional(),
  phone: phone.optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional()
}).refine(
  (data) => Boolean(data.userId) || Boolean(data.name && data.email && data.phone),
  {
    message: "Either userId or complete user details (name, email, and phone) must be provided"
  }
)

const updateDoctorSchema = atLeastOneField(
  z.object({
    name: name.optional(),
    specialization: specialization.optional(),
    departmentId: id("Department ID").optional(),
    phone: phone.optional(),
    email: email.optional(),
    userId: id("User ID").optional().nullable()
  })
)

module.exports = { createDoctorSchema, updateDoctorSchema }
