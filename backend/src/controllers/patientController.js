const { Op } = require("sequelize")
const { Patients, Appointments, Medical_records, Prescriptions, Doctors } = require("../../models")
const AppError = require("../utils/appError")

const getPatients = async (req, res, next) => {
  try {
    const where = {}

    // If logged in as Doctor and not requesting all patients for a clinical dropdown,
    // only list this doctor's patients in the directory
    if (req.user && req.user.role === "doctor" && req.query.scope !== "all" && req.query.all !== "true") {
      const doctorProfile = await Doctors.findOne({ where: { userId: req.user.id } })
      if (!doctorProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          patients: []
        })
      }

      const [apptPatients, recordPatients, rxPatients] = await Promise.all([
        Appointments.findAll({ where: { doctorId: doctorProfile.id }, attributes: ["patientId"] }),
        Medical_records.findAll({ where: { doctorId: doctorProfile.id }, attributes: ["patientId"] }),
        Prescriptions.findAll({ where: { doctorId: doctorProfile.id }, attributes: ["patientId"] })
      ])

      const patientIdSet = new Set([
        ...apptPatients.map((a) => a.patientId),
        ...recordPatients.map((r) => r.patientId),
        ...rxPatients.map((p) => p.patientId)
      ])

      const patientIds = Array.from(patientIdSet)
      if (patientIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          patients: []
        })
      }

      where.id = { [Op.in]: patientIds }
    }

    const patients = await Patients.findAll({
      where,
      order: [["id", "ASC"]]
    })

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    })
  } catch (error) {
    next(error)
  }
}

const getPatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const patient = await Patients.findByPk(id, {
      include: [
        {
          model: Appointments,
          as: "appointments",
          include: [{ model: Doctors, as: "doctor", attributes: ["id", "specialization"] }]
        },
        {
          model: Medical_records,
          as: "medicalRecords",
          include: [{ model: Doctors, as: "doctor", attributes: ["id", "specialization"] }]
        },
        {
          model: Prescriptions,
          as: "prescriptions",
          include: [{ model: Doctors, as: "doctor", attributes: ["id", "specialization"] }]
        }
      ]
    })

    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    res.status(200).json({
      success: true,
      patient
    })
  } catch (error) {
    next(error)
  }
}

const addPatient = async (req, res, next) => {
  try {
    const { name, dateOfBirth, gender, phone, email, address } = req.body

    const existingPatient = await Patients.findOne({ where: { email } })
    if (existingPatient) {
      throw new AppError("A patient with this email already exists", 409)
    }

    const patient = await Patients.create({
      name,
      dateOfBirth,
      gender,
      phone,
      email,
      address
    })

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient
    })
  } catch (error) {
    next(error)
  }
}

const updatePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const patient = await Patients.findByPk(id)
    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    const { name, dateOfBirth, gender, phone, email, address } = req.body

    if (email !== undefined && email !== patient.email) {
      const existing = await Patients.findOne({ where: { email } })
      if (existing && existing.id !== id) {
        throw new AppError("A patient with this email already exists", 409)
      }
    }

    await patient.update({
      name: name ?? patient.name,
      dateOfBirth: dateOfBirth ?? patient.dateOfBirth,
      gender: gender ?? patient.gender,
      phone: phone ?? patient.phone,
      email: email ?? patient.email,
      address: address ?? patient.address
    })

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient
    })
  } catch (error) {
    next(error)
  }
}

const deletePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const patient = await Patients.findByPk(id)
    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    const patientData = patient.toJSON()
    await patient.destroy()

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      patient: patientData
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPatients,
  getPatient,
  addPatient,
  updatePatient,
  deletePatient
}
