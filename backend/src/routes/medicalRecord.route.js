const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createMedicalRecordSchema, updateMedicalRecordSchema } = require("../validators/medicalRecord")
const {
  getMedicalRecords,
  getMedicalRecord,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require("../controllers/medicalRecordController")

router.get("/", authenticate, authorize("admin", "doctor", "nurse"), getMedicalRecords)
router.get("/:id", authenticate, authorize("admin", "doctor", "nurse"), validate(idParamSchema, "params"), getMedicalRecord)
router.post("/", authenticate, authorize("admin", "doctor"), validate(createMedicalRecordSchema), addMedicalRecord)
router.put("/:id", authenticate, authorize("admin", "doctor"), validate(idParamSchema, "params"), validate(updateMedicalRecordSchema), updateMedicalRecord)
router.delete("/:id", authenticate, authorize("admin", "doctor"), validate(idParamSchema, "params"), deleteMedicalRecord)

module.exports = router
