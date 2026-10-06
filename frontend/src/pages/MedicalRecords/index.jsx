import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FileText, Filter, Calendar } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { formatDate } from '../../utils/formatters'
import { MedicalRecordModal } from './MedicalRecordModal'

export const MedicalRecords = () => {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin', 'doctor')

  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  const [patientFilter, setPatientFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (patientFilter) params.append('patientId', patientFilter)
      if (doctorFilter) params.append('doctorId', doctorFilter)

      const queryString = params.toString() ? `?${params.toString()}` : ''

      const [recordsRes, patientsRes, docsRes] = await Promise.all([
        api.get(`/medical-records${queryString}`),
        api.get('/patients?scope=all'),
        api.get('/doctors')
      ])

      setRecords(recordsRes.data?.medicalRecords || [])
      setPatients(patientsRes.data?.patients || [])
      setDoctors(docsRes.data?.doctors || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load medical records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [patientFilter, doctorFilter])

  const handleCreate = () => {
    setSelectedRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (rec) => {
    setSelectedRecord(rec)
    setIsModalOpen(true)
  }

  const handleDelete = async (rec) => {
    if (!window.confirm(`Are you sure you want to delete medical record #${rec.id} (${rec.diagnosis})?`)) {
      return
    }

    setDeletingId(rec.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/medical-records/${rec.id}`)
      setSuccess(`Medical record #${rec.id} deleted successfully`)
      fetchData()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete medical record')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      header: 'Diagnosis',
      accessor: 'diagnosis',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 leading-snug">{row.diagnosis}</p>
          <span className="text-xs text-slate-400 font-medium">Record #{row.id} • {formatDate(row.date)}</span>
        </div>
      )
    },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 leading-snug">{row.patient?.name || `Patient #${row.patientId}`}</p>
          <p className="text-xs text-slate-400">DOB: {formatDate(row.patient?.dateOfBirth)}</p>
        </div>
      )
    },
    {
      header: 'Attending Doctor',
      accessor: 'doctor',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 leading-snug">{row.doctor?.name || `Doctor #${row.doctorId}`}</p>
          <p className="text-xs text-teal-700 font-medium">{row.doctor?.specialization || ''}</p>
        </div>
      )
    },
    {
      header: 'Symptoms & Treatment',
      accessor: 'symptoms',
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-[280px] space-y-1">
          <p className="truncate"><strong className="text-slate-700">Symp:</strong> {row.symptoms}</p>
          <p className="truncate"><strong className="text-slate-700">Tx:</strong> {row.treatment}</p>
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        if (!canManage) return null

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit2}
              onClick={() => handleEdit(row)}
              title="Edit Clinical Record"
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
              title="Delete Clinical Record"
            >
              Delete
            </Button>
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
          <h1 className="text-2xl font-bold text-slate-900">Clinical Medical Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access patient diagnoses, clinical histories, presenting symptoms, and therapeutic treatments
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            New Medical Record
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

      {/* Records DataTable */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No medical records found."
      />

      {isModalOpen && (
        <MedicalRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          record={selectedRecord}
          patients={patients}
          doctors={doctors}
          onSaved={() => {
            fetchData()
            setSuccess(selectedRecord ? 'Medical record updated' : 'Medical record created successfully')
          }}
        />
      )}
    </div>
  )
}
