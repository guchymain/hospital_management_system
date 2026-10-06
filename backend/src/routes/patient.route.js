const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createPatientSchema, updatePatientSchema } = require("../validators/patient")
const {
  getPatients,
  getPatient,
  addPatient,
  updatePatient,
  deletePatient
} = require("../controllers/patientController")

router.get("/", authenticate, getPatients)
router.get("/:id", authenticate, validate(idParamSchema, "params"), getPatient)
router.post("/", authenticate, authorize("admin", "receptionist"), validate(createPatientSchema), addPatient)
router.put("/:id", authenticate, authorize("admin", "receptionist"), validate(idParamSchema, "params"), validate(updatePatientSchema), updatePatient)
router.delete("/:id", authenticate, authorize("admin", "receptionist"), validate(idParamSchema, "params"), deletePatient)

module.exports = router
