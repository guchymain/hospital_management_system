import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Textarea } from '../../components/Form/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export const AppointmentModal = ({ isOpen, onClose, appointment, patients = [], doctors = [], onSaved }) => {
  const { user, hasRole } = useAuth()
  const isDoctor = hasRole('doctor')
  const isAdmin = hasRole('admin')

  const isEditing = !!appointment
  const isCompleted = appointment?.status === 'completed'
  const isReadOnlyForDoctor = isEditing && isCompleted && isDoctor && !isAdmin

  // Find current doctor's profile ID if user is a doctor
  const myDoctorProfile = doctors.find((d) => d.userId === user?.id)

  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId ? String(appointment.patientId) : '')
      setDoctorId(appointment.doctorId ? String(appointment.doctorId) : '')
      if (appointment.appointmentDate) {
        const d = new Date(appointment.appointmentDate)
        const pad = (n) => String(n).padStart(2, '0')
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        setAppointmentDate(formatted)
      } else {
        setAppointmentDate('')
      }
      setStatus(appointment.status || 'scheduled')
      setReason(appointment.reason || '')
    } else {
      setPatientId(patients[0] ? String(patients[0].id) : '')
      // Pre-select current doctor if user is doctor
      if (isDoctor && myDoctorProfile) {
        setDoctorId(String(myDoctorProfile.id))
      } else {
        setDoctorId(doctors[0] ? String(doctors[0].id) : '')
      }
      const tmrw = new Date(Date.now() + 86400000)
      tmrw.setHours(10, 0, 0, 0)
      const pad = (n) => String(n).padStart(2, '0')
      const formatted = `${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())}T${pad(tmrw.getHours())}:${pad(tmrw.getMinutes())}`
      setAppointmentDate(formatted)
      setStatus('scheduled')
      setReason('')
    }
    setError('')
  }, [appointment, patients, doctors, isOpen, isDoctor, myDoctorProfile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isReadOnlyForDoctor) return

    setLoading(true)
    setError('')

    try {
      const selectedDocId = isDoctor && myDoctorProfile ? myDoctorProfile.id : Number(doctorId)

      const payload = {
        patientId: Number(patientId),
        doctorId: selectedDocId,
        appointmentDate: new Date(appointmentDate).toISOString(),
        status,
        reason: reason.trim()
      }

      if (isEditing) {
        await api.put(`/appointments/${appointment.id}`, payload)
      } else {
        await api.post('/appointments', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to schedule appointment')
    } finally {
      setLoading(false)
    }
  }

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: `${p.name} (ID #${p.id})`
  }))

  const doctorOptions = doctors.map((d) => ({
    value: String(d.id),
    label: `${d.name} (${d.specialization})`
  }))

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Appointment' : 'Book New Appointment'}
      subtitle={isEditing ? `Modify consultation #${appointment.id}` : 'Connect patient and attending specialist'}
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
      {isReadOnlyForDoctor && (
        <Alert
          type="warning"
          message="This appointment is marked as completed and is locked from doctor modifications. Only an administrator can edit completed appointments."
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Patient"
          name="patientId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          options={patientOptions}
          disabled={isReadOnlyForDoctor}
          required
        />

        {/* Doctor selector - locked to logged-in doctor if role is doctor */}
        {isDoctor ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Attending Doctor
            </label>
            <div className="py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium">
              {myDoctorProfile ? `${myDoctorProfile.name} (${myDoctorProfile.specialization})` : 'Your Doctor Profile'}
            </div>
          </div>
        ) : (
          <Select
            label="Attending Doctor"
            name="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={doctorOptions}
            disabled={isReadOnlyForDoctor}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Appointment Date & Time"
            name="appointmentDate"
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            disabled={isReadOnlyForDoctor}
            required
          />

          <Select
            label="Appointment Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            disabled={isReadOnlyForDoctor}
            required
          />
        </div>

        <Textarea
          label="Reason for Visit / Symptoms"
          name="reason"
          placeholder="Chief complaints, consultation goals, or notes..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={isReadOnlyForDoctor}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {isReadOnlyForDoctor ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnlyForDoctor && (
            <Button type="submit" variant="primary" loading={loading}>
              {isEditing ? 'Save Changes' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}
