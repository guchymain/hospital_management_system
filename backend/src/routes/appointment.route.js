const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createAppointmentSchema, updateAppointmentSchema } = require("../validators/appointment")
const {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointmentController")

router.get("/", authenticate, getAppointments)
router.get("/:id", authenticate, validate(idParamSchema, "params"), getAppointment)
router.post("/", authenticate, authorize("admin", "receptionist", "doctor"), validate(createAppointmentSchema), addAppointment)
router.put("/:id", authenticate, authorize("admin", "receptionist", "doctor"), validate(idParamSchema, "params"), validate(updateAppointmentSchema), updateAppointment)
router.delete("/:id", authenticate, authorize("admin", "receptionist"), validate(idParamSchema, "params"), deleteAppointment)

module.exports = router
