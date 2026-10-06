const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const diagnosis = z
  .string({
    required_error: "Diagnosis is required",
    invalid_type_error: "Diagnosis must be a string"
  })
  .trim()
  .min(2, "Diagnosis must be at least 2 characters")
  .max(1000, "Diagnosis must not exceed 1000 characters")

const symptoms = z
  .string({
    required_error: "Symptoms are required",
    invalid_type_error: "Symptoms must be a string"
  })
  .trim()
  .min(2, "Symptoms must be at least 2 characters")
  .max(1000, "Symptoms must not exceed 1000 characters")

const treatment = z
  .string({
    required_error: "Treatment is required",
    invalid_type_error: "Treatment must be a string"
  })
  .trim()
  .min(2, "Treatment must be at least 2 characters")
  .max(1000, "Treatment must not exceed 1000 characters")

const notes = z.string().trim().max(2000).optional().default("")

const recordDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional()

const createMedicalRecordSchema = z.object({
  patientId: id("Patient ID"),
  doctorId: id("Doctor ID"),
  diagnosis,
  symptoms,
  treatment,
  notes,
  date: recordDate
}).strict()

const updateMedicalRecordSchema = atLeastOneField(
  z.object({
    patientId: id("Patient ID").optional(),
    doctorId: id("Doctor ID").optional(),
    diagnosis: diagnosis.optional(),
    symptoms: symptoms.optional(),
    treatment: treatment.optional(),
    notes: z.string().trim().max(2000).optional(),
    date: recordDate
  })
)

module.exports = { createMedicalRecordSchema, updateMedicalRecordSchema }
