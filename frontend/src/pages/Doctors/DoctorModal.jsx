import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const DoctorModal = ({ isOpen, onClose, doctor, departments = [], onSaved }) => {
  const isEditing = !!doctor

  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '')
      setSpecialization(doctor.specialization || '')
      setDepartmentId(doctor.departmentId ? String(doctor.departmentId) : '')
      setPhone(doctor.phone || '')
      setEmail(doctor.email || '')
    } else {
      setName('')
      setSpecialization('')
      setDepartmentId(departments[0] ? String(departments[0].id) : '')
      setPhone('')
      setEmail('')
    }
    setError('')
  }, [doctor, departments, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: name.trim(),
        specialization: specialization.trim(),
        departmentId: Number(departmentId),
        phone: phone.trim(),
        email: email.trim()
      }

      if (isEditing) {
        await api.put(`/doctors/${doctor.id}`, payload)
      } else {
        await api.post('/doctors', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save doctor details')
    } finally {
      setLoading(false)
    }
  }

  const deptOptions = departments.map((d) => ({
    value: String(d.id),
    label: d.name
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Doctor Profile' : 'Add New Doctor'}
      subtitle={isEditing ? `Update details for ${doctor.name}` : 'Register a new clinical specialist in the hospital'}
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="Dr. First Last"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Specialization"
            name="specialization"
            placeholder="e.g. Cardiologist, General Surgeon"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          />

          <Select
            label="Department"
            name="departmentId"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={deptOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="08020000001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Professional Email"
            name="email"
            type="email"
            placeholder="doctor.name@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Register Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
