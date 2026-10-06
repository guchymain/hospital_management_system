import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Filter, Mail, Phone, Building2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { DoctorModal } from './DoctorModal'

export const Doctors = () => {
  const { user, hasRole } = useAuth()
  const isAdmin = hasRole('admin')

  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const deptUrl = '/departments'
      const docUrl = selectedDeptId ? `/doctors?departmentId=${selectedDeptId}` : '/doctors'

      const [docsRes, deptsRes] = await Promise.all([
        api.get(docUrl),
        api.get(deptUrl)
      ])

      setDoctors(docsRes.data?.doctors || [])
      setDepartments(deptsRes.data?.departments || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load doctors list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDeptId])

  const handleCreate = () => {
    setSelectedDoctor(null)
    setIsModalOpen(true)
  }

  const handleEdit = (doc) => {
    setSelectedDoctor(doc)
    setIsModalOpen(true)
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete profile for ${doc.name}?`)) {
      return
    }

    setDeletingId(doc.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/doctors/${doc.id}`)
      setSuccess(`Doctor "${doc.name}" deleted successfully`)
      fetchData()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete doctor')
    } finally {
      setDeletingId(null)
    }
  }

  // Check if current user can edit this doctor
  const canEditDoctor = (doc) => {
    if (isAdmin) return true
    if (hasRole('doctor') && doc.userId === user?.id) return true
    return false
  }

  const columns = [
    {
      header: 'Doctor',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
            {row.name.replace(/^Dr\.\s*/i, '').charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-snug">{row.name}</p>
            <p className="text-xs text-teal-700 font-medium">{row.specialization}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          {row.department?.name || `Dept #${row.departmentId}`}
        </span>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          <p className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {row.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {row.email}
          </p>
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const canEdit = canEditDoctor(row)
        const canDelete = isAdmin

        if (!canEdit && !canDelete) return null

        return (
          <div className="flex items-center justify-end gap-1.5">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(row)
                }}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                loading={deletingId === row.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(row)
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Physicians & Specialists</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse hospital doctors, specializations, and departmental affiliations
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Add Doctor
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <label htmlFor="deptFilter" className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
          Filter Department:
        </label>
        <select
          id="deptFilter"
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          className="text-sm py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All Departments ({departments.length})</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {selectedDeptId && (
          <button
            type="button"
            onClick={() => setSelectedDeptId('')}
            className="text-xs text-teal-600 hover:underline font-medium ml-2"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Doctors Table */}
      <DataTable
        columns={columns}
        data={doctors}
        loading={loading}
        emptyMessage="No doctors matching the current filter."
      />

      {isModalOpen && (
        <DoctorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctor={selectedDoctor}
          departments={departments}
          onSaved={() => {
            fetchData()
            setSuccess(selectedDoctor ? 'Doctor profile updated' : 'Doctor profile registered successfully')
          }}
        />
      )}
    </div>
  )
}
