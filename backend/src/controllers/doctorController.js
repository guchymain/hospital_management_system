const bcrypt = require("../utils/bcrypt")
const { Doctors, Departments, Users, Appointments, Medical_records, Prescriptions, sequelize } = require("../../models")
const AppError = require("../utils/appError")

const getDoctors = async (req, res, next) => {
  try {
    const where = {}

    if (req.query.departmentId) {
      where.departmentId = Number(req.query.departmentId)
    }

    const doctors = await Doctors.findAll({
      where,
      include: [
        {
          model: Departments,
          as: "department",
          attributes: ["id", "name"]
        },
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email", "phone", "role"]
        }
      ],
      order: [["id", "ASC"]]
    })

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    })
  } catch (error) {
    next(error)
  }
}

const getDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const doctor = await Doctors.findByPk(id, {
      include: [
        {
          model: Departments,
          as: "department",
          attributes: ["id", "name", "description"]
        },
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email", "phone", "role"]
        }
      ]
    })

    if (!doctor) {
      throw new AppError("Doctor not found", 404)
    }

    res.status(200).json({
      success: true,
      doctor
    })
  } catch (error) {
    next(error)
  }
}

const addDoctor = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { name, specialization, departmentId, phone, email, userId, password } = req.body

    const department = await Departments.findByPk(departmentId, { transaction: t })
    if (!department) {
      throw new AppError("Department does not exist", 404)
    }

    let targetUserId = userId

    if (targetUserId) {
      const user = await Users.findByPk(targetUserId, { transaction: t })
      if (!user) {
        throw new AppError("User account does not exist", 404)
      }
      const existingProfile = await Doctors.findOne({ where: { userId: targetUserId }, transaction: t })
      if (existingProfile) {
        throw new AppError("A doctor profile is already linked to this user account", 409)
      }
    } else {
      const existingUser = await Users.findOne({ where: { email }, transaction: t })
      if (existingUser) {
        throw new AppError("A user with this email already exists", 409)
      }

      const defaultPassword = password || "Doctor@123"
      const hashedPassword = await bcrypt.hash(defaultPassword, Number(process.env.SALT_ROUNDS))

      const newUser = await Users.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "doctor"
      }, { transaction: t })

      targetUserId = newUser.id
    }

    const doctor = await Doctors.create({
      userId: targetUserId,
      departmentId,
      specialization
    }, { transaction: t })

    await t.commit()

    const populated = await Doctors.findByPk(doctor.id, {
      include: [
        { model: Departments, as: "department", attributes: ["id", "name", "description"] },
        { model: Users, as: "user", attributes: ["id", "name", "email", "phone", "role"] }
      ]
    })

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: populated
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const updateDoctor = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const id = Number(req.params.id)

    const doctor = await Doctors.findByPk(id, {
      include: [{ model: Users, as: "user" }],
      transaction: t
    })
    if (!doctor) {
      throw new AppError("Doctor not found", 404)
    }

    // Role check: doctor can only update their own profile; admin can update any
    if (req.user && req.user.role === "doctor" && doctor.userId !== req.user.id) {
      throw new AppError("Forbidden. You can only update your own doctor profile", 403)
    }

    const { name, specialization, departmentId, phone, email, userId } = req.body

    if (departmentId !== undefined) {
      const department = await Departments.findByPk(departmentId, { transaction: t })
      if (!department) {
        throw new AppError("Department does not exist", 404)
      }
    }

    let targetUserId = doctor.userId
    if (userId !== undefined && userId !== null && userId !== doctor.userId) {
      const newUser = await Users.findByPk(userId, { transaction: t })
      if (!newUser) {
        throw new AppError("User account does not exist", 404)
      }
      const existingProfile = await Doctors.findOne({ where: { userId }, transaction: t })
      if (existingProfile && existingProfile.id !== id) {
        throw new AppError("A doctor profile is already linked to this user account", 409)
      }
      targetUserId = userId
    }

    if (name !== undefined || email !== undefined || phone !== undefined) {
      if (email !== undefined && doctor.user && email !== doctor.user.email) {
        const existingEmail = await Users.findOne({ where: { email }, transaction: t })
        if (existingEmail && existingEmail.id !== targetUserId) {
          throw new AppError("A user with this email already exists", 409)
        }
      }

      const userUpdateData = {}
      if (name !== undefined) userUpdateData.name = name
      if (email !== undefined) userUpdateData.email = email
      if (phone !== undefined) userUpdateData.phone = phone

      await Users.update(userUpdateData, {
        where: { id: targetUserId },
        transaction: t
      })
    }

    const doctorUpdateData = {}
    if (specialization !== undefined) doctorUpdateData.specialization = specialization
    if (departmentId !== undefined) doctorUpdateData.departmentId = departmentId
    if (targetUserId !== doctor.userId) doctorUpdateData.userId = targetUserId

    if (Object.keys(doctorUpdateData).length > 0) {
      await doctor.update(doctorUpdateData, { transaction: t })
    }

    await t.commit()

    const populated = await Doctors.findByPk(doctor.id, {
      include: [
        { model: Departments, as: "department", attributes: ["id", "name", "description"] },
        { model: Users, as: "user", attributes: ["id", "name", "email", "phone", "role"] }
      ]
    })

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: populated
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const deleteDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const doctor = await Doctors.findByPk(id, {
      include: [{ model: Users, as: "user" }]
    })
    if (!doctor) {
      throw new AppError("Doctor not found", 404)
    }

    const appointmentCount = await Appointments.count({ where: { doctorId: id } })
    if (appointmentCount > 0) {
      throw new AppError("Cannot delete doctor because associated appointments exist", 400)
    }

    const recordCount = await Medical_records.count({ where: { doctorId: id } })
    if (recordCount > 0) {
      throw new AppError("Cannot delete doctor because associated medical records exist", 400)
    }

    const prescriptionCount = await Prescriptions.count({ where: { doctorId: id } })
    if (prescriptionCount > 0) {
      throw new AppError("Cannot delete doctor because associated prescriptions exist", 400)
    }

    const doctorData = doctor.toJSON()
    await doctor.destroy()

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      doctor: doctorData
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDoctors,
  getDoctor,
  addDoctor,
  updateDoctor,
  deleteDoctor
}
