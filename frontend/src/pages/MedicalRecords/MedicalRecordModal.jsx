import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Textarea } from '../../components/Form/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const MedicalRecordModal = ({ isOpen, onClose, record, patients = [], doctors = [], onSaved }) => {
  const isEditing = !!record

  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [treatment, setTreatment] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (record) {
      setPatientId(record.patientId ? String(record.patientId) : '')
      setDoctorId(record.doctorId ? String(record.doctorId) : '')
      setDiagnosis(record.diagnosis || '')
      setSymptoms(record.symptoms || '')
      setTreatment(record.treatment || '')
      setNotes(record.notes || '')
      setDate(record.date ? record.date.slice(0, 10) : '')
    } else {
      setPatientId(patients[0] ? String(patients[0].id) : '')
      setDoctorId(doctors[0] ? String(doctors[0].id) : '')
      setDiagnosis('')
      setSymptoms('')
      setTreatment('')
      setNotes('')
      setDate(new Date().toISOString().split('T')[0])
    }
    setError('')
  }, [record, patients, doctors, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim(),
        treatment: treatment.trim(),
        notes: notes.trim(),
        date: date || new Date().toISOString().split('T')[0]
      }

      if (isEditing) {
        await api.put(`/medical-records/${record.id}`, payload)
      } else {
        await api.post('/medical-records', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save medical record')
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medical Record' : 'Create Clinical Medical Record'}
      subtitle={isEditing ? `Clinical entry #${record.id}` : 'Record formal diagnosis, presenting symptoms, and therapeutic treatment'}
      maxWidth="max-w-2xl"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Patient"
            name="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={patientOptions}
            required
          />

          <Select
            label="Diagnosing Doctor"
            name="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={doctorOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Diagnosis"
            name="diagnosis"
            placeholder="e.g. Essential Hypertension, Bronchitis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />

          <Input
            label="Consultation Date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Presenting Symptoms"
          name="symptoms"
          placeholder="Detailed description of symptoms reported by the patient..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
          rows={2}
        />

        <Textarea
          label="Prescribed Treatment / Intervention"
          name="treatment"
          placeholder="Therapeutic plan, recommended procedures, or lifestyle modifications..."
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          required
          rows={2}
        />

        <Textarea
          label="Clinical Progress Notes"
          name="notes"
          placeholder="Observations, vital signs, follow-up schedule..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Save Medical Record'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
