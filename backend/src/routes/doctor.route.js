const express = require("express")
const router = express.Router()

const { authenticate, optionalAuthenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createDoctorSchema, updateDoctorSchema } = require("../validators/doctor")
const {
  getDoctors,
  getDoctor,
  addDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController")

router.get("/", optionalAuthenticate, getDoctors)
router.get("/:id", optionalAuthenticate, validate(idParamSchema, "params"), getDoctor)
router.post("/", authenticate, authorize("admin"), validate(createDoctorSchema), addDoctor)
router.put("/:id", authenticate, authorize("admin", "doctor"), validate(idParamSchema, "params"), validate(updateDoctorSchema), updateDoctor)
router.delete("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), deleteDoctor)

module.exports = router
