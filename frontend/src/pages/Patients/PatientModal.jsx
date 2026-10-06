import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Textarea } from '../../components/Form/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const PatientModal = ({ isOpen, onClose, patient, onSaved }) => {
  const isEditing = !!patient

  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('male')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (patient) {
      setName(patient.name || '')
      setDateOfBirth(patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '')
      setGender(patient.gender || 'male')
      setPhone(patient.phone || '')
      setEmail(patient.email || '')
      setAddress(patient.address || '')
    } else {
      setName('')
      setDateOfBirth('')
      setGender('male')
      setPhone('')
      setEmail('')
      setAddress('')
    }
    setError('')
  }, [patient, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: name.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim()
      }

      if (isEditing) {
        await api.put(`/patients/${patient.id}`, payload)
      } else {
        await api.post('/patients', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save patient')
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patient Profile' : 'Register New Patient'}
      subtitle={isEditing ? `Update demographics for ${patient.name}` : 'Fill in patient medical intake demographics'}
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          name="name"
          placeholder="Firstname Lastname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />

          <Select
            label="Gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genderOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="08050000001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Residential Address"
          name="address"
          placeholder="Street address, city, state..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
