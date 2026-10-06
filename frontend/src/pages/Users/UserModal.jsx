import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Select } from '../../components/Form/Select'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const UserModal = ({ isOpen, onClose, user, onSaved }) => {
  const isEditing = !!user

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('receptionist')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setPassword('')
      setRole(user.role || 'receptionist')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setRole('receptionist')
    }
    setError('')
  }, [user, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role
      }

      if (password.trim()) {
        payload.password = password.trim()
      }

      if (isEditing) {
        await api.put(`/users/${user.id}`, payload)
      } else {
        if (!password.trim()) {
          setError('Password is required for new user creation')
          setLoading(false)
          return
        }
        await api.post('/users', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save staff user')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'admin', label: 'Admin (Full Hospital Management)' },
    { value: 'doctor', label: 'Doctor (Clinical Records & Prescriptions)' },
    { value: 'nurse', label: 'Nurse (Patient Care & Clinical Chart Viewer)' },
    { value: 'receptionist', label: 'Receptionist (Front Desk & Appointments)' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff User' : 'Register New Staff User'}
      subtitle={isEditing ? `Modify account for ${user.name}` : 'Create an administrative or medical user account with assigned role'}
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="Firstname Lastname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="user@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="08010000001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <Select
          label="Assigned System Role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions}
          required
        />

        <Input
          label={isEditing ? 'New Password (Leave blank to keep existing)' : 'Account Password'}
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditing}
          helperText={isEditing ? 'Only fill if you wish to reset this user\'s password' : 'Must be at least 6 characters'}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Staff Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
