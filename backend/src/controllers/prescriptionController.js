const { Prescriptions, Prescription_items, Patients, Doctors, Departments, Users, Appointments, sequelize } = require("../../models")
const AppError = require("../utils/appError")

const formatPrescription = (prescription) => {
  const plain = prescription.toJSON()

  const items = (plain.items || []).map((item) => ({
    id: item.id,
    prescriptionId: item.prescriptionId,
    medicationName: item.medicationName,
    dosage: item.dosage,
    frequency: item.frequency,
    duration: item.duration,
    quantity: item.quantity,
    instructions: item.instructions,
    createdAt: item.createdAt
  }))

  return {
    id: plain.id,
    patientId: plain.patientId,
    patient: plain.patient || null,
    doctorId: plain.doctorId,
    doctor: plain.doctor || null,
    appointmentId: plain.appointmentId,
    notes: plain.notes,
    prescriptionDate: plain.prescriptionDate,
    itemCount: items.length,
    items,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  }
}

const getPrescriptionIncludes = () => [
  {
    model: Patients,
    as: "patient",
    attributes: ["id", "name", "dateOfBirth", "gender", "phone"]
  },
  {
    model: Doctors,
    as: "doctor",
    include: [
      { model: Departments, as: "department", attributes: ["id", "name"] },
      { model: Users, as: "user", attributes: ["id", "name", "email", "phone"] }
    ]
  },
  {
    model: Prescription_items,
    as: "items"
  }
]

const getPrescriptions = async (req, res, next) => {
  try {
    const where = {}

    if (req.query.patientId) {
      where.patientId = Number(req.query.patientId)
    }

    if (req.query.doctorId) {
      where.doctorId = Number(req.query.doctorId)
    }

    const prescriptions = await Prescriptions.findAll({
      where,
      include: getPrescriptionIncludes(),
      order: [["prescriptionDate", "DESC"], ["id", "DESC"]]
    })

    const formatted = prescriptions.map(formatPrescription)

    res.status(200).json({
      success: true,
      count: formatted.length,
      prescriptions: formatted
    })
  } catch (error) {
    next(error)
  }
}

const getPrescription = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const prescription = await Prescriptions.findByPk(id, {
      include: getPrescriptionIncludes()
    })

    if (!prescription) {
      throw new AppError("Prescription not found", 404)
    }

    res.status(200).json({
      success: true,
      prescription: formatPrescription(prescription)
    })
  } catch (error) {
    next(error)
  }
}

const addPrescription = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { patientId, doctorId, appointmentId, notes, prescriptionDate, items } = req.body

    const patient = await Patients.findByPk(patientId, { transaction: t })
    if (!patient) {
      throw new AppError("Patient not found", 404)
    }

    const doctor = await Doctors.findByPk(doctorId, { transaction: t })
    if (!doctor) {
      throw new AppError("Doctor not found", 404)
    }

    if (appointmentId) {
      const appointment = await Appointments.findByPk(appointmentId, { transaction: t })
      if (!appointment) {
        throw new AppError("Appointment not found", 404)
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Prescription must contain at least one medication item", 400)
    }

    const prescription = await Prescriptions.create(
      {
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        notes: notes || "",
        prescriptionDate: prescriptionDate || new Date().toISOString().split("T")[0]
      },
      { transaction: t }
    )

    const itemsToCreate = items.map((item) => ({
      prescriptionId: prescription.id,
      medicationName: item.medicationName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantity: item.quantity,
      instructions: item.instructions || ""
    }))

    await Prescription_items.bulkCreate(itemsToCreate, { transaction: t })

    await t.commit()

    const populated = await Prescriptions.findByPk(prescription.id, {
      include: getPrescriptionIncludes()
    })

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: formatPrescription(populated)
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const updatePrescription = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const id = Number(req.params.id)

    const prescription = await Prescriptions.findByPk(id, { transaction: t })
    if (!prescription) {
      throw new AppError("Prescription not found", 404)
    }

    const { patientId, doctorId, appointmentId, notes, prescriptionDate, items } = req.body

    if (patientId !== undefined) {
      const patient = await Patients.findByPk(patientId, { transaction: t })
      if (!patient) {
        throw new AppError("Patient not found", 404)
      }
      prescription.patientId = patientId
    }

    if (doctorId !== undefined) {
      const doctor = await Doctors.findByPk(doctorId, { transaction: t })
      if (!doctor) {
        throw new AppError("Doctor not found", 404)
      }
      prescription.doctorId = doctorId
    }

    if (appointmentId !== undefined) {
      if (appointmentId !== null) {
        const appointment = await Appointments.findByPk(appointmentId, { transaction: t })
        if (!appointment) {
          throw new AppError("Appointment not found", 404)
        }
      }
      prescription.appointmentId = appointmentId
    }

    if (notes !== undefined) {
      prescription.notes = notes
    }

    if (prescriptionDate !== undefined) {
      prescription.prescriptionDate = prescriptionDate
    }

    if (items !== undefined && Array.isArray(items)) {
      if (items.length === 0) {
        throw new AppError("Prescription must contain at least one medication item", 400)
      }

      await Prescription_items.destroy({
        where: { prescriptionId: id },
        transaction: t
      })

      const itemsToCreate = items.map((item) => ({
        prescriptionId: id,
        medicationName: item.medicationName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions || ""
      }))

      await Prescription_items.bulkCreate(itemsToCreate, { transaction: t })
    }

    await prescription.save({ transaction: t })
    await t.commit()

    const populated = await Prescriptions.findByPk(id, {
      include: getPrescriptionIncludes()
    })

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription: formatPrescription(populated)
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const deletePrescription = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const prescription = await Prescriptions.findByPk(id, {
      include: [{ model: Prescription_items, as: "items" }]
    })

    if (!prescription) {
      throw new AppError("Prescription not found", 404)
    }

    const data = formatPrescription(prescription)
    await prescription.destroy()

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
      prescription: data
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPrescriptions,
  getPrescription,
  addPrescription,
  updatePrescription,
  deletePrescription
}
