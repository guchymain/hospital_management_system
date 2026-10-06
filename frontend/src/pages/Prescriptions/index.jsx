import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Pill, Eye, Filter } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { formatDate } from '../../utils/formatters'
import { PrescriptionFormModal } from './PrescriptionFormModal'
import { PrescriptionDetails } from './PrescriptionDetails'

export const Prescriptions = () => {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin', 'doctor')

  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])

  const [patientFilter, setPatientFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)

  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedForView, setSelectedForView] = useState(null)

  const [deletingId, setDeletingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (patientFilter) params.append('patientId', patientFilter)
      if (doctorFilter) params.append('doctorId', doctorFilter)

      const queryString = params.toString() ? `?${params.toString()}` : ''

      const [prescRes, patientsRes, docsRes, apptsRes] = await Promise.all([
        api.get(`/prescriptions${queryString}`),
        api.get('/patients?scope=all'),
        api.get('/doctors'),
        api.get('/appointments')
      ])

      setPrescriptions(prescRes.data?.prescriptions || [])
      setPatients(patientsRes.data?.patients || [])
      setDoctors(docsRes.data?.doctors || [])
      setAppointments(apptsRes.data?.appointments || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [patientFilter, doctorFilter])

  const handleCreate = () => {
    setSelectedForEdit(null)
    setIsFormOpen(true)
  }

  const handleEdit = (presc) => {
    setSelectedForEdit(presc)
    setIsFormOpen(true)
  }

  const handleView = (presc) => {
    setSelectedForView(presc)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (presc) => {
    if (!window.confirm(`Are you sure you want to delete Prescription #${presc.id}? This will remove all associated line items.`)) {
      return
    }

    setDeletingId(presc.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/prescriptions/${presc.id}`)
      setSuccess(`Prescription #${presc.id} deleted successfully`)
      fetchData()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete prescription')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      header: 'Prescription ID',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Pill className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900">Rx #{row.id}</span>
        </div>
      )
    },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 leading-snug">{row.patient?.name || `Patient #${row.patientId}`}</p>
          <p className="text-xs text-slate-400">{row.patient?.phone || ''}</p>
        </div>
      )
    },
    {
      header: 'Prescribing Doctor',
      accessor: 'doctor',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 leading-snug">{row.doctor?.name || `Doctor #${row.doctorId}`}</p>
          <p className="text-xs text-teal-700 font-medium">{row.doctor?.specialization || ''}</p>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'prescriptionDate',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {formatDate(row.prescriptionDate)}
        </span>
      )
    },
    {
      header: 'Medications',
      accessor: 'itemCount',
      render: (row) => {
        const count = row.itemCount || (row.items || []).length
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {count} {count === 1 ? 'Medication' : 'Medications'}
          </span>
        )
      }
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
            onClick={() => handleView(row)}
            title="View Itemized Chart"
          >
            View
          </Button>

          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => handleEdit(row)}
                title="Edit Prescription"
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
                title="Delete Prescription"
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
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions & Dispensary</h1>
          <p className="text-sm text-slate-500 mt-1">
            Electronic prescription orders, medication items, dosages, and pharmacy records
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            New Prescription
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>

        <select
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All Patients ({patients.length})</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All Doctors ({doctors.length})</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {(patientFilter || doctorFilter) && (
          <button
            type="button"
            onClick={() => {
              setPatientFilter('')
              setDoctorFilter('')
            }}
            className="text-xs text-teal-600 hover:underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Prescriptions DataTable */}
      <DataTable
        columns={columns}
        data={prescriptions}
        loading={loading}
        emptyMessage="No prescriptions recorded."
        onRowClick={(row) => handleView(row)}
      />

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <PrescriptionFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          prescription={selectedForEdit}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          onSaved={() => {
            fetchData()
            setSuccess(selectedForEdit ? 'Prescription updated successfully' : 'Prescription issued successfully')
          }}
        />
      )}

      {/* Itemized Chart Modal */}
      {isDetailsOpen && (
        <PrescriptionDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          prescription={selectedForView}
        />
      )}
    </div>
  )
}
