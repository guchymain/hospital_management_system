import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Pill } from 'lucide-react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Textarea } from '../../components/Form/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const PrescriptionFormModal = ({
  isOpen,
  onClose,
  prescription,
  patients = [],
  doctors = [],
  appointments = [],
  onSaved
}) => {
  const isEditing = !!prescription

  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [prescriptionDate, setPrescriptionDate] = useState('')
  const [notes, setNotes] = useState('')

  // Medication items array
  const [items, setItems] = useState([
    {
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      instructions: ''
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prescription) {
      setPatientId(prescription.patientId ? String(prescription.patientId) : '')
      setDoctorId(prescription.doctorId ? String(prescription.doctorId) : '')
      setAppointmentId(prescription.appointmentId ? String(prescription.appointmentId) : '')
      setPrescriptionDate(prescription.prescriptionDate ? prescription.prescriptionDate.slice(0, 10) : '')
      setNotes(prescription.notes || '')
      if (prescription.items && prescription.items.length > 0) {
        setItems(
          prescription.items.map((it) => ({
            medicationName: it.medicationName || '',
            dosage: it.dosage || '',
            frequency: it.frequency || '',
            duration: it.duration || '',
            quantity: it.quantity || 1,
            instructions: it.instructions || ''
          }))
        )
      } else {
        setItems([
          { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }
        ])
      }
    } else {
      setPatientId(patients[0] ? String(patients[0].id) : '')
      setDoctorId(doctors[0] ? String(doctors[0].id) : '')
      setAppointmentId('')
      setPrescriptionDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setItems([
        { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }
      ])
    }
    setError('')
  }, [prescription, patients, doctors, isOpen])

  // Add medication row
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 1,
        instructions: ''
      }
    ])
  }

  // Remove medication row
  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setError('Prescription must contain at least one medication item.')
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Update item field
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client validation: check each medication row
    if (items.length === 0) {
      setError('Prescription must contain at least one medication.')
      return
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.medicationName.trim()) {
        setError(`Medication #${i + 1}: Name is required`)
        return
      }
      if (!it.dosage.trim()) {
        setError(`Medication #${i + 1}: Dosage is required (e.g. 500mg)`)
        return
      }
      if (!it.frequency.trim()) {
        setError(`Medication #${i + 1}: Frequency is required (e.g. 3 times daily)`)
        return
      }
      if (!it.duration.trim()) {
        setError(`Medication #${i + 1}: Duration is required (e.g. 5 days)`)
        return
      }
      if (!it.quantity || Number(it.quantity) <= 0) {
        setError(`Medication #${i + 1}: Quantity must be greater than zero`)
        return
      }
    }

    setLoading(true)

    try {
      const payload = {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentId: appointmentId ? Number(appointmentId) : null,
        prescriptionDate: prescriptionDate || new Date().toISOString().split('T')[0],
        notes: notes.trim(),
        items: items.map((it) => ({
          medicationName: it.medicationName.trim(),
          dosage: it.dosage.trim(),
          frequency: it.frequency.trim(),
          duration: it.duration.trim(),
          quantity: Number(it.quantity),
          instructions: it.instructions.trim()
        }))
      }

      if (isEditing) {
        await api.put(`/prescriptions/${prescription.id}`, payload)
      } else {
        await api.post('/prescriptions', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save prescription')
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

  const appointmentOptions = [
    { value: '', label: 'None (Standalone Prescription)' },
    ...appointments
      .filter((a) => !patientId || String(a.patientId) === String(patientId))
      .map((a) => ({
        value: String(a.id),
        label: `Appointment #${a.id} (${new Date(a.appointmentDate).toLocaleDateString()})`
      }))
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Prescription' : 'Issue New Prescription'}
      subtitle={isEditing ? `Modify prescription #${prescription.id}` : 'Create an itemized multi-medication prescription'}
      maxWidth="max-w-3xl"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Prescription Header */}
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
            label="Prescribing Doctor"
            name="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={doctorOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Linked Appointment (Optional)"
            name="appointmentId"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            options={appointmentOptions}
          />

          <Input
            label="Prescription Date"
            name="prescriptionDate"
            type="date"
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Prescription Instructions / General Notes"
          name="notes"
          placeholder="e.g. Take with plenty of water after meals. Report any allergic reactions immediately."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Prescription Items Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Prescribed Medications ({items.length})
              </h4>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Medication
            </Button>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group transition hover:border-teal-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 rounded"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <Input
                    label="Medication Name"
                    placeholder="e.g. Paracetamol"
                    value={item.medicationName}
                    onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)}
                    required
                  />

                  <Input
                    label="Dosage"
                    placeholder="e.g. 500mg, 10ml"
                    value={item.dosage}
                    onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                    required
                  />

                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    placeholder="20"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <Input
                    label="Frequency"
                    placeholder="e.g. 3 times daily, Every 8 hours"
                    value={item.frequency}
                    onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                    required
                  />

                  <Input
                    label="Duration"
                    placeholder="e.g. 5 days, 1 month"
                    value={item.duration}
                    onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Specific Patient Instructions"
                  placeholder="e.g. Take 1 tablet after meals with water"
                  value={item.instructions}
                  onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Prescription' : 'Issue Prescription'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
