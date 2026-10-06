const { Departments, Doctors } = require("../../models")
const AppError = require("../utils/appError")

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Departments.findAll({
      include: [
        {
          model: Doctors,
          as: "doctors",
          attributes: ["id", "name", "specialization", "phone", "email"]
        }
      ],
      order: [["id", "ASC"]]
    })

    const formatted = departments.map((d) => {
      const plain = d.toJSON()
      return {
        ...plain,
        doctorCount: (plain.doctors || []).length
      }
    })

    res.status(200).json({
      success: true,
      count: formatted.length,
      departments: formatted
    })
  } catch (error) {
    next(error)
  }
}

const getDepartment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const department = await Departments.findByPk(id, {
      include: [
        {
          model: Doctors,
          as: "doctors",
          attributes: ["id", "name", "specialization", "phone", "email"]
        }
      ]
    })

    if (!department) {
      throw new AppError("Department not found", 404)
    }

    const plain = department.toJSON()

    res.status(200).json({
      success: true,
      department: {
        ...plain,
        doctorCount: (plain.doctors || []).length
      }
    })
  } catch (error) {
    next(error)
  }
}

const addDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body

    const existing = await Departments.findOne({ where: { name } })
    if (existing) {
      throw new AppError("A department with this name already exists", 409)
    }

    const department = await Departments.create({ name, description })

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department
    })
  } catch (error) {
    next(error)
  }
}

const updateDepartment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const department = await Departments.findByPk(id)
    if (!department) {
      throw new AppError("Department not found", 404)
    }

    const { name, description } = req.body

    if (name && name !== department.name) {
      const existing = await Departments.findOne({ where: { name } })
      if (existing && existing.id !== id) {
        throw new AppError("A department with this name already exists", 409)
      }
    }

    await department.update({
      name: name ?? department.name,
      description: description ?? department.description
    })

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department
    })
  } catch (error) {
    next(error)
  }
}

const deleteDepartment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const department = await Departments.findByPk(id, {
      include: [{ model: Doctors, as: "doctors" }]
    })

    if (!department) {
      throw new AppError("Department not found", 404)
    }

    if (department.doctors && department.doctors.length > 0) {
      throw new AppError("Cannot delete department because doctors are currently assigned to it", 400)
    }

    const data = department.toJSON()
    await department.destroy()

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      department: data
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDepartments,
  getDepartment,
  addDepartment,
  updateDepartment,
  deleteDepartment
}
