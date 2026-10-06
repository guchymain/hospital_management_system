const express = require("express")
const router = express.Router()

const { authenticate, optionalAuthenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createDepartmentSchema, updateDepartmentSchema } = require("../validators/department")
const {
  getDepartments,
  getDepartment,
  addDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController")

router.get("/", optionalAuthenticate, getDepartments)
router.get("/:id", optionalAuthenticate, validate(idParamSchema, "params"), getDepartment)
router.post("/", authenticate, authorize("admin"), validate(createDepartmentSchema), addDepartment)
router.put("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), validate(updateDepartmentSchema), updateDepartment)
router.delete("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), deleteDepartment)

module.exports = router
