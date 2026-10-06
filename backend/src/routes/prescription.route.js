const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createPrescriptionSchema, updatePrescriptionSchema } = require("../validators/prescription")
const {
  getPrescriptions,
  getPrescription,
  addPrescription,
  updatePrescription,
  deletePrescription
} = require("../controllers/prescriptionController")

router.get("/", authenticate, authorize("admin", "doctor", "nurse"), getPrescriptions)
router.get("/:id", authenticate, authorize("admin", "doctor", "nurse"), validate(idParamSchema, "params"), getPrescription)
router.post("/", authenticate, authorize("admin", "doctor"), validate(createPrescriptionSchema), addPrescription)
router.put("/:id", authenticate, authorize("admin", "doctor"), validate(idParamSchema, "params"), validate(updatePrescriptionSchema), updatePrescription)
router.delete("/:id", authenticate, authorize("admin", "doctor"), validate(idParamSchema, "params"), deletePrescription)

module.exports = router
