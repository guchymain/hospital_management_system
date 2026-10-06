import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CalendarDays, Filter, CheckCircle2, XCircle, Lock } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { StatusBadge } from '../../components/Badge/StatusBadge'
import { formatDateTime } from '../../utils/formatters'
import { AppointmentModal } from './AppointmentModal'

export const Appointments = () => {
  const { user, hasRole } = useAuth()
  const isDoctor = hasRole('doctor')
  const isAdmin = hasRole('admin')
  const canCreate = hasRole('admin', 'receptionist', 'doctor')
  const canDelete = hasRole('admin', 'receptionist')

  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (doctorFilter && !isDoctor) params.append('doctorId', doctorFilter)
      if (dateFilter) params.append('date', dateFilter)

      const queryString = params.toString() ? `?${params.toString()}` : ''

      const [apptsRes, patientsRes, docsRes] = await Promise.all([
        api.get(`/appointments${queryString}`),
        api.get('/patients?scope=all'),
        api.get('/doctors')
      ])

      setAppointments(apptsRes.data?.appointments || [])
      setPatients(patientsRes.data?.patients || [])
      setDoctors(docsRes.data?.doctors || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, doctorFilter, dateFilter])

  const handleCreate = () => {
    setSelectedAppt(null)
    setIsModalOpen(true)
  }

  const handleEdit = (appt) => {
    setSelectedAppt(appt)
    setIsModalOpen(true)
  }

  const handleQuickStatus = async (appt, newStatus) => {
    setUpdatingStatusId(appt.id)
    setError('')
    try {
      await api.put(`/appointments/${appt.id}`, { status: newStatus })
      setSuccess(`Appointment #${appt.id} marked as ${newStatus}`)
      fetchData()
    } catch (err) {
      setError(err.displayMessage || `Failed to update status`)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleDelete = async (appt) => {
    if (!window.confirm(`Are you sure you want to cancel and delete appointment #${appt.id}?`)) {
      return
    }

    setDeletingId(appt.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/appointments/${appt.id}`)
      setSuccess(`Appointment #${appt.id} deleted successfully`)
      fetchData()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete appointment')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 leading-snug">{row.patient?.name || `Patient #${row.patientId}`}</p>
          <p className="text-xs text-slate-400">{row.patient?.phone || ''}</p>
        </div>
      )
    },
    ...(!isDoctor ? [{
      header: 'Doctor',
      accessor: 'doctor',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 leading-snug">{row.doctor?.name || `Doctor #${row.doctorId}`}</p>
          <p className="text-xs text-teal-700 font-medium">{row.doctor?.specialization || row.doctor?.department?.name || ''}</p>
        </div>
      )
    }] : []),
    {
      header: 'Scheduled Date & Time',
      accessor: 'appointmentDate',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          {formatDateTime(row.appointmentDate)}
        </span>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-[200px] truncate" title={row.reason}>
          {row.reason || 'General Checkup'}
        </p>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        // Doctor cannot edit completed appointments; Admin can edit any appointment
        const isCompleted = row.status === 'completed'
        const canDoctorEdit = isDoctor && !isCompleted
        const canStaffEdit = isAdmin || (!isDoctor && canCreate)
        const allowEdit = isAdmin || canDoctorEdit || (canStaffEdit && !isCompleted)

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Quick status transition buttons when scheduled */}
            {row.status === 'scheduled' && canCreate && (
              <>
                <button
                  type="button"
                  disabled={updatingStatusId === row.id}
                  onClick={() => handleQuickStatus(row, 'completed')}
                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition"
                  title="Mark as Completed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={updatingStatusId === row.id}
                  onClick={() => handleQuickStatus(row, 'cancelled')}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                  title="Mark as Cancelled"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {allowEdit ? (
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => handleEdit(row)}
                title="Edit Appointment"
              >
                Edit
              </Button>
            ) : isCompleted && isDoctor ? (
              <span className="text-xs text-slate-400 font-medium px-2 py-1 flex items-center gap-1" title="Completed appointments cannot be edited by a doctor">
                <Lock className="w-3 h-3 text-slate-400" /> Locked
              </span>
            ) : null}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                loading={deletingId === row.id}
                onClick={() => handleDelete(row)}
                title="Cancel & Delete"
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
          <h1 className="text-2xl font-bold text-slate-900">
            {isDoctor ? 'My Appointments Schedule' : 'Appointments Schedule'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isDoctor
              ? 'View and manage your scheduled clinical consultations'
              : 'Track, schedule, and update clinical consultations and specialist visits'}
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Book Appointment
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

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Doctor filter (Only shown for non-doctors) */}
        {!isDoctor && (
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
        )}

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />

        {(statusFilter || doctorFilter || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('')
              setDoctorFilter('')
              setDateFilter('')
            }}
            className="text-xs text-teal-600 hover:underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Appointments DataTable */}
      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        emptyMessage={isDoctor ? 'No appointments scheduled for you matching the selected filters.' : 'No appointments found matching the selected filters.'}
      />

      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppt}
          patients={patients}
          doctors={doctors}
          onSaved={() => {
            fetchData()
            setSuccess(selectedAppt ? 'Appointment updated successfully' : 'New appointment booked successfully')
          }}
        />
      )}
    </div>
  )
}
