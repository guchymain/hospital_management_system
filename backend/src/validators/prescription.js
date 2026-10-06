const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const prescriptionItemSchema = z.object({
  medicationName: z
    .string({ required_error: "Medication name is required" })
    .trim()
    .min(2, "Medication name must be at least 2 characters")
    .max(150, "Medication name must not exceed 150 characters"),
  dosage: z
    .string({ required_error: "Dosage is required" })
    .trim()
    .min(1, "Dosage is required")
    .max(100, "Dosage must not exceed 100 characters"),
  frequency: z
    .string({ required_error: "Frequency is required" })
    .trim()
    .min(1, "Frequency is required")
    .max(100, "Frequency must not exceed 100 characters"),
  duration: z
    .string({ required_error: "Duration is required" })
    .trim()
    .min(1, "Duration is required")
    .max(100, "Duration must not exceed 100 characters"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than zero"),
  instructions: z.string().trim().max(1000).optional().default("")
})

const createPrescriptionSchema = z.object({
  patientId: id("Patient ID"),
  doctorId: id("Doctor ID"),
  appointmentId: id("Appointment ID").optional().nullable(),
  notes: z.string().trim().max(1000).optional().default(""),
  prescriptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Prescription date must be in YYYY-MM-DD format").optional(),
  items: z.array(prescriptionItemSchema).min(1, "Prescription must contain at least one medication item")
}).strict()

const updatePrescriptionSchema = atLeastOneField(
  z.object({
    patientId: id("Patient ID").optional(),
    doctorId: id("Doctor ID").optional(),
    appointmentId: id("Appointment ID").optional().nullable(),
    notes: z.string().trim().max(1000).optional(),
    prescriptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Prescription date must be in YYYY-MM-DD format").optional(),
    items: z.array(prescriptionItemSchema).min(1, "Items array must contain at least one medication item").optional()
  })
)

module.exports = { createPrescriptionSchema, updatePrescriptionSchema, prescriptionItemSchema }
