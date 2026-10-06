import React, { useState, useEffect } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Input } from '../../components/Form/Input'
import { Textarea } from '../../components/Form/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import api from '../../services/api'

export const DepartmentModal = ({ isOpen, onClose, department, onSaved }) => {
  const isEditing = !!department

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (department) {
      setName(department.name || '')
      setDescription(department.description || '')
    } else {
      setName('')
      setDescription('')
    }
    setError('')
  }, [department, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = { name: name.trim(), description: description.trim() }

      if (isEditing) {
        await api.put(`/departments/${department.id}`, payload)
      } else {
        await api.post('/departments', payload)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.displayMessage || 'Failed to save department')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Department' : 'Create Department'}
      subtitle={isEditing ? `Update details for ${department.name}` : 'Add a new hospital medical specialty'}
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Department Name"
          name="name"
          placeholder="e.g. Cardiology, Pediatrics, Surgery"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description / Scope"
          name="description"
          placeholder="Clinical focus, specialized facilities, and patient care scope..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
