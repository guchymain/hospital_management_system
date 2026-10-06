import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, User, UserCheck } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { formatDate, capitalize } from '../../utils/formatters'
import { PatientModal } from './PatientModal'

export const Patients = () => {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const isDoctor = hasRole('doctor')
  const canManage = hasRole('admin', 'receptionist')

  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchPatients = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/patients')
      setPatients(response.data?.patients || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleCreate = () => {
    setSelectedPatient(null)
    setIsModalOpen(true)
  }

  const handleEdit = (p) => {
    setSelectedPatient(p)
    setIsModalOpen(true)
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete patient "${p.name}"? This will delete all associated appointments and clinical history.`)) {
      return
    }

    setDeletingId(p.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/patients/${p.id}`)
      setSuccess(`Patient "${p.name}" deleted successfully`)
      fetchPatients()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete patient')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPatients = patients.filter((p) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    )
  })

  const columns = [
    {
      header: 'Patient Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              to={`/patients/${row.id}`}
              className="font-semibold text-slate-900 hover:text-teal-600 transition leading-snug inline-block"
            >
              {row.name}
            </Link>
            <p className="text-xs text-slate-400">ID #{row.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'DOB / Gender',
      accessor: 'dateOfBirth',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{formatDate(row.dateOfBirth)}</p>
          <p className="text-slate-400 capitalize">{capitalize(row.gender)}</p>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{row.phone}</p>
          <p className="text-slate-400 truncate max-w-[160px]">{row.email}</p>
        </div>
      )
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-[220px] truncate" title={row.address}>
          {row.address}
        </p>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/patients/${row.id}`)}
            title="View Patient Chart"
          >
            Chart
          </Button>

          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => handleEdit(row)}
                title="Edit Demographics"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                loading={deletingId === row.id}
                onClick={() => handleDelete(row)}
                title="Delete Patient"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isDoctor ? 'My Patients Directory' : 'Patient Directory'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isDoctor
              ? 'Patients under your clinical care with scheduled consultations or clinical records'
              : 'Manage patient electronic profiles, clinical charts, and registered demographics'}
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Register Patient
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition"
          />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Patients Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        loading={loading}
        emptyMessage={
          searchTerm
            ? 'No patients matching your search criteria.'
            : isDoctor
            ? 'No patients currently assigned to your care.'
            : 'No patients registered in the hospital database.'
        }
        onRowClick={(row) => navigate(`/patients/${row.id}`)}
      />

      {isModalOpen && (
        <PatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patient={selectedPatient}
          onSaved={() => {
            fetchPatients()
            setSuccess(selectedPatient ? 'Patient record updated' : 'New patient registered successfully')
          }}
        />
      )}
    </div>
  )
}
