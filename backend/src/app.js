const express = require("express")
const cors = require("cors")
const app = express()

const logger = require("./middleware/logger")
const errorHandler = require("./middleware/error")
const notFound = require("./middleware/notFound")
const { apiLimiter } = require("./middleware/rateLimiter")

const authRoutes = require("./routes/auth.route")
const userRoutes = require("./routes/user.route")
const departmentRoutes = require("./routes/department.route")
const doctorRoutes = require("./routes/doctor.route")
const patientRoutes = require("./routes/patient.route")
const appointmentRoutes = require("./routes/appointment.route")
const medicalRecordRoutes = require("./routes/medicalRecord.route")
const prescriptionRoutes = require("./routes/prescription.route")

const corsOrigin = process.env.CORS_ORIGIN
const corsOptions = {
  origin: corsOrigin && corsOrigin !== "*" ? corsOrigin.split(",").map((item) => item.trim()) : true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))
app.use(logger)
app.use(express.json({ limit: "10kb" }))

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Hospital Management System API is running"
  })
})

app.use("/api", apiLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/medical-records", medicalRecordRoutes)
app.use("/api/prescriptions", prescriptionRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
