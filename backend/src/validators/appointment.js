const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const appointmentDate = z
  .string({
    required_error: "Appointment date/time is required",
    invalid_type_error: "Appointment date/time must be a valid date string"
  })
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date format for appointment")

const status = z.enum(["scheduled", "completed", "cancelled"], {
  errorMap: () => ({ message: "Status must be scheduled, completed, or cancelled" })
})

const reason = z.string().trim().max(1000).optional().default("")

const createAppointmentSchema = z.object({
  patientId: id("Patient ID"),
  doctorId: id("Doctor ID"),
  appointmentDate,
  status: status.optional().default("scheduled"),
  reason
}).strict()

const updateAppointmentSchema = atLeastOneField(
  z.object({
    patientId: id("Patient ID").optional(),
    doctorId: id("Doctor ID").optional(),
    appointmentDate: appointmentDate.optional(),
    status: status.optional(),
    reason: z.string().trim().max(1000).optional()
  })
)

module.exports = { createAppointmentSchema, updateAppointmentSchema, status }
