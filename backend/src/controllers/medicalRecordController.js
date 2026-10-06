const { Medical_records, Patients, Doctors, Departments, Users } = require("../../models")
const AppError = require("../utils/appError")

const doctorInclude = {
  model: Doctors,
  as: "doctor",
  include: [
    { model: Departments, as: "department", attributes: ["id", "name"] },
    { model: Users, as: "user", attributes: ["id", "name", "email", "phone"] }
  ]
}

const getMedicalRecords = async (req, res, next) => {
  try {
    const where = {}

    if (req.query.patientId) {
      where.patientId = Number(req.query.patientId)
    }

    if (req.query.doctorId) {
      where.doctorId = Number(req.query.doctorId)
    }

    const records = await Medical_records.findAll({
      where,
      include: [
        {
          model: Patients,
          as: "patient",
          attributes: ["id", "name", "gender", "dateOfBirth", "phone"]
        },
        doctorInclude
      ],
      order: [["date", "DESC"], ["id", "DESC"]]
    })

    res.status(200).json({
      success: true,
      count: records.length,
      medicalRecords: records
    })
  } catch (error) {
    next(error)
  }
}

const getMedicalRecord = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const record = await Medical_records.findByPk(id, {
      include: [
        {
          model: Patients,
          as: "patient"
        },
        doctorInclude
      ]
    })

    if (!record) {
      throw new AppError("Medical record not found", 404)
    }

    res.status(200).json({
      success: true,
      medicalRecord: record
    })
  } catch (error) {
    next(error)
  }
}

const addMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, doctorId, diagnosis, symptoms, treatment, notes, date } = req.body

    const patient = await Patients.findByPk(patientId)
    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    const doctor = await Doctors.findByPk(doctorId)
    if (!doctor) {
      throw new AppError("Doctor not found", 404)
    }

    const record = await Medical_records.create({
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      treatment,
      notes,
      date: date || new Date().toISOString().split("T")[0]
    })

    const populated = await Medical_records.findByPk(record.id, {
      include: [
        { model: Patients, as: "patient", attributes: ["id", "name", "gender", "dateOfBirth"] },
        doctorInclude
      ]
    })

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord: populated
    })
  } catch (error) {
    next(error)
  }
}

const updateMedicalRecord = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const record = await Medical_records.findByPk(id)
    if (!record) {
      throw new AppError("Medical record not found", 404)
    }

    const { patientId, doctorId, diagnosis, symptoms, treatment, notes, date } = req.body

    if (patientId !== undefined) {
      const patient = await Patients.findByPk(patientId)
      if (!patient) {
        throw new AppError("Patient not found", 404)
      }
    }

    if (doctorId !== undefined) {
      const doctor = await Doctors.findByPk(doctorId)
      if (!doctor) {
        throw new AppError("Doctor not found", 404)
      }
    }

    await record.update({
      patientId: patientId ?? record.patientId,
      doctorId: doctorId ?? record.doctorId,
      diagnosis: diagnosis ?? record.diagnosis,
      symptoms: symptoms ?? record.symptoms,
      treatment: treatment ?? record.treatment,
      notes: notes ?? record.notes,
      date: date ?? record.date
    })

    const populated = await Medical_records.findByPk(record.id, {
      include: [
        { model: Patients, as: "patient", attributes: ["id", "name", "gender", "dateOfBirth"] },
        doctorInclude
      ]
    })

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      medicalRecord: populated
    })
  } catch (error) {
    next(error)
  }
}

const deleteMedicalRecord = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const record = await Medical_records.findByPk(id)
    if (!record) {
      throw new AppError("Medical record not found", 404)
    }

    const data = record.toJSON()
    await record.destroy()

    res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
      medicalRecord: data
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMedicalRecords,
  getMedicalRecord,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
}
