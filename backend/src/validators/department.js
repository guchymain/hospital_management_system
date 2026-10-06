const { z } = require("zod")
const { name, atLeastOneField } = require("./common")

const description = z.string().trim().max(500).optional().default("")

const createDepartmentSchema = z.object({
  name,
  description
}).strict()

const updateDepartmentSchema = atLeastOneField(
  z.object({
    name: name.optional(),
    description: z.string().trim().max(500).optional()
  })
)

module.exports = { createDepartmentSchema, updateDepartmentSchema }
