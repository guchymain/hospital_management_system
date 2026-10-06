import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText, Pill, CalendarDays } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/Loading/Spinner'
import { Alert } from '../../components/ErrorMessage/Alert'
import { StatusBadge } from '../../components/Badge/StatusBadge'
import { formatDate, formatDateTime, capitalize } from '../../utils/formatters'

export const PatientDetails = () => {
  const { id } = useParams()
  const { hasRole } = useAuth()
  const canViewClinical = hasRole('admin', 'doctor', 'nurse')

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/patients/${id}`)
        setPatient(response.data?.patient || null)
      } catch (err) {
        setError(err.displayMessage || 'Failed to load patient records')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  if (loading) {
    return <PageLoader message="Loading patient chart..." />
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Link>
        <Alert type="error" message={error || 'Patient record could not be found.'} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold text-xl shadow-xs">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Patient #{patient.id}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {capitalize(patient.gender)} • Born {formatDate(patient.dateOfBirth)}
              </p>
            </div>
          </div>
        </div>

        {/* Demographics details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 text-sm">
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Phone Number</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Email Address</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Residential Address</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Appointments ({patient.appointments?.length || 0})</h2>
          </div>
        </div>

        {(!patient.appointments || patient.appointments.length === 0) ? (
          <p className="text-sm text-slate-400 py-4 text-center">No appointments booked for this patient.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.appointments.map((appt) => (
              <div key={appt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {appt.doctor?.name ? `Consultation with ${appt.doctor.name}` : `Doctor #${appt.doctorId}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDateTime(appt.appointmentDate)} • {appt.reason || 'Routine checkup'}
                  </p>
                </div>
                <div>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical History Tabs: Medical Records & Prescriptions */}
      {canViewClinical && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical Records */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                Medical Records ({patient.medicalRecords?.length || 0})
              </h2>
            </div>

            {(!patient.medicalRecords || patient.medicalRecords.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">No clinical records found.</p>
            ) : (
              <div className="space-y-4">
                {patient.medicalRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{record.diagnosis}</span>
                      <span className="text-xs text-slate-400 font-medium">{formatDate(record.date)}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p><strong className="text-slate-700">Symptoms:</strong> {record.symptoms}</p>
                      <p><strong className="text-slate-700">Treatment:</strong> {record.treatment}</p>
                      {record.notes && <p><strong className="text-slate-700">Notes:</strong> {record.notes}</p>}
                      <p className="text-slate-400 pt-1">
                        Recorded by {record.doctor?.name || `Doctor #${record.doctorId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">
                Prescriptions ({patient.prescriptions?.length || 0})
              </h2>
            </div>

            {(!patient.prescriptions || patient.prescriptions.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">No prescriptions issued.</p>
            ) : (
              <div className="space-y-4">
                {patient.prescriptions.map((presc) => (
                  <div key={presc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">Prescription #{presc.id}</span>
                      <span className="text-xs text-slate-400 font-medium">{formatDate(presc.prescriptionDate)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      Prescribed by {presc.doctor?.name || `Doctor #${presc.doctorId}`}
                    </p>
                    {presc.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                        "{presc.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
