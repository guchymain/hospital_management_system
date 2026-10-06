const { Op } = require("sequelize")
const { Appointments, Patients, Doctors, Departments, Users, Prescriptions } = require("../../models")
const AppError = require("../utils/appError")

const doctorInclude = {
  model: Doctors,
  as: "doctor",
  include: [
    { model: Departments, as: "department", attributes: ["id", "name"] },
    { model: Users, as: "user", attributes: ["id", "name", "email", "phone"] }
  ]
}

const getAppointments = async (req, res, next) => {
  try {
    const where = {}

    // Doctors can strictly ONLY view their own appointments
    if (req.user && req.user.role === "doctor") {
      const doctorProfile = await Doctors.findOne({ where: { userId: req.user.id } })
      if (!doctorProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          appointments: []
        })
      }
      where.doctorId = doctorProfile.id
    } else if (req.query.doctorId) {
      where.doctorId = Number(req.query.doctorId)
    }

    if (req.query.patientId) {
      where.patientId = Number(req.query.patientId)
    }

    if (req.query.status) {
      where.status = req.query.status
    }

    if (req.query.date) {
      const searchDate = new Date(req.query.date)
      const nextDate = new Date(searchDate)
      nextDate.setDate(nextDate.getDate() + 1)
      where.appointmentDate = {
        [Op.gte]: searchDate,
        [Op.lt]: nextDate
      }
    }

    const appointments = await Appointments.findAll({
      where,
      include: [
        {
          model: Patients,
          as: "patient",
          attributes: ["id", "name", "gender", "phone", "email"]
        },
        doctorInclude
      ],
      order: [["appointmentDate", "ASC"]]
    })

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    })
  } catch (error) {
    next(error)
  }
}

const getAppointment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const appointment = await Appointments.findByPk(id, {
      include: [
        {
          model: Patients,
          as: "patient"
        },
        doctorInclude,
        {
          model: Prescriptions,
          as: "prescription"
        }
      ]
    })

    if (!appointment) {
      throw new AppError("Appointment not found", 404)
    }

    // Doctors can only view their own appointment
    if (req.user && req.user.role === "doctor") {
      const doctorProfile = await Doctors.findOne({ where: { userId: req.user.id } })
      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        throw new AppError("Forbidden. You can only view your own appointments", 403)
      }
    }

    res.status(200).json({
      success: true,
      appointment
    })
  } catch (error) {
    next(error)
  }
}

const addAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, status = "scheduled", reason } = req.body

    const patient = await Patients.findByPk(patientId)
    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    let targetDoctorId = doctorId

    // If logged in as doctor, automatically lock booking to this doctor
    if (req.user && req.user.role === "doctor") {
      const doctorProfile = await Doctors.findOne({ where: { userId: req.user.id } })
      if (!doctorProfile) {
        throw new AppError("Doctor profile not found for this account", 404)
      }
      targetDoctorId = doctorProfile.id
    } else {
      const doctor = await Doctors.findByPk(targetDoctorId)
      if (!doctor) {
        throw new AppError("Doctor not found", 404)
      }
    }

    const appointment = await Appointments.create({
      patientId,
      doctorId: targetDoctorId,
      appointmentDate: new Date(appointmentDate),
      status,
      reason
    })

    const populated = await Appointments.findByPk(appointment.id, {
      include: [
        { model: Patients, as: "patient", attributes: ["id", "name", "gender", "phone"] },
        doctorInclude
      ]
    })

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: populated
    })
  } catch (error) {
    next(error)
  }
}

const updateAppointment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const appointment = await Appointments.findByPk(id)
    if (!appointment) {
      throw new AppError("Appointment not found", 404)
    }

    // Role-based restrictions:
    // - Doctor: can ONLY edit their own appointment, and CANNOT modify completed appointments.
    // - Admin: can edit any doctor's appointment, EVEN IF marked completed.
    if (req.user && req.user.role === "doctor") {
      const doctorProfile = await Doctors.findOne({ where: { userId: req.user.id } })
      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        throw new AppError("Forbidden. You can only update your own appointments", 403)
      }

      if (appointment.status === "completed") {
        throw new AppError("Forbidden. Completed appointments cannot be modified by a doctor", 403)
      }
    }

    const { patientId, doctorId, appointmentDate, status, reason } = req.body

    if (patientId !== undefined) {
      const patient = await Patients.findByPk(patientId)
      if (!patient) {
        throw new AppError("Patient not found", 404)
      }
    }

    let targetDoctorId = appointment.doctorId
    if (doctorId !== undefined) {
      if (req.user && req.user.role === "doctor" && doctorId !== appointment.doctorId) {
        throw new AppError("Forbidden. Doctors cannot reassign appointments to other doctors", 403)
      }
      const doctor = await Doctors.findByPk(doctorId)
      if (!doctor) {
        throw new AppError("Doctor not found", 404)
      }
      targetDoctorId = doctorId
    }

    await appointment.update({
      patientId: patientId ?? appointment.patientId,
      doctorId: targetDoctorId,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : appointment.appointmentDate,
      status: status ?? appointment.status,
      reason: reason ?? appointment.reason
    })

    const populated = await Appointments.findByPk(appointment.id, {
      include: [
        { model: Patients, as: "patient", attributes: ["id", "name", "gender", "phone"] },
        doctorInclude
      ]
    })

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: populated
    })
  } catch (error) {
    next(error)
  }
}

const deleteAppointment = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const appointment = await Appointments.findByPk(id)
    if (!appointment) {
      throw new AppError("Appointment not found", 404)
    }

    const appointmentData = appointment.toJSON()
    await appointment.destroy()

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      appointment: appointmentData
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment
}
