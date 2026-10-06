const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createUserSchema, updateUserSchema } = require("../validators/user")
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
} = require("../controllers/userController")

router.get("/", authenticate, authorize("admin"), getUsers)
router.get("/:id", authenticate, validate(idParamSchema, "params"), getUser)
router.post("/", authenticate, authorize("admin"), validate(createUserSchema), addUser)
router.put("/:id", authenticate, validate(idParamSchema, "params"), validate(updateUserSchema), updateUser)
router.delete("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), deleteUser)

module.exports = router
