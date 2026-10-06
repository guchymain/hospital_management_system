import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  FileText,
  Pill,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { PageLoader } from '../components/Loading/Spinner'
import { Alert } from '../components/ErrorMessage/Alert'
import { StatusBadge } from '../components/Badge/StatusBadge'
import { formatDateTime } from '../utils/formatters'

export const Dashboard = () => {
  const { user, hasRole } = useAuth()

  const [stats, setStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    departmentsCount: 0,
    appointmentsCount: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    recordsCount: null,
    prescriptionsCount: null
  })

  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')

      try {
        const requests = [
          api.get('/patients'),
          api.get('/doctors'),
          api.get('/departments'),
          api.get('/appointments')
        ]

        if (hasRole('admin', 'doctor', 'nurse')) {
          requests.push(api.get('/medical-records'))
          requests.push(api.get('/prescriptions'))
        }

        const results = await Promise.allSettled(requests)

        const patientsRes = results[0].status === 'fulfilled' ? results[0].value.data : null
        const doctorsRes = results[1].status === 'fulfilled' ? results[1].value.data : null
        const deptsRes = results[2].status === 'fulfilled' ? results[2].value.data : null
        const apptsRes = results[3].status === 'fulfilled' ? results[3].value.data : null

        const appointments = apptsRes?.appointments || []
        const scheduled = appointments.filter((a) => a.status === 'scheduled').length
        const completed = appointments.filter((a) => a.status === 'completed').length

        let recordsCount = null
        let prescriptionsCount = null

        if (hasRole('admin', 'doctor', 'nurse')) {
          const recRes = results[4]?.status === 'fulfilled' ? results[4].value.data : null
          const prescRes = results[5]?.status === 'fulfilled' ? results[5].value.data : null
          recordsCount = recRes?.count ?? recRes?.medicalRecords?.length ?? 0
          prescriptionsCount = prescRes?.count ?? prescRes?.prescriptions?.length ?? 0
        }

        setStats({
          patientsCount: patientsRes?.count ?? patientsRes?.patients?.length ?? 0,
          doctorsCount: doctorsRes?.count ?? doctorsRes?.doctors?.length ?? 0,
          departmentsCount: deptsRes?.count ?? deptsRes?.departments?.length ?? 0,
          appointmentsCount: appointments.length,
          scheduledAppointments: scheduled,
          completedAppointments: completed,
          recordsCount,
          prescriptionsCount
        })

        // Sort appointments by date descending and grab first 5
        const sorted = [...appointments].sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
        )
        setRecentAppointments(sorted.slice(0, 5))
      } catch (err) {
        setError(err.displayMessage || 'Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <PageLoader message="Loading dashboard overview..." />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-teal-700 capitalize">{user?.role}</span>. Here is your hospital system overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={user?.role} className="text-xs px-3 py-1" />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Link
          to="/patients"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.patientsCount}</span>
            <span className="text-xs font-medium text-teal-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          to="/doctors"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Doctors</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.doctorsCount}</span>
            <span className="text-xs font-medium text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Directory <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          to="/appointments"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appointments</span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.appointmentsCount}</span>
            <span className="text-xs font-medium text-cyan-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Schedule <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          to="/departments"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departments</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.departmentsCount}</span>
            <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Departments <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Appointment Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Scheduled</p>
            <p className="text-2xl font-bold text-slate-900">{stats.scheduledAppointments}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Completed</p>
            <p className="text-2xl font-bold text-slate-900">{stats.completedAppointments}</p>
          </div>
        </div>

        {hasRole('admin', 'doctor', 'nurse') && stats.recordsCount !== null ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Clinical Records</p>
              <p className="text-2xl font-bold text-slate-900">{stats.recordsCount}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Patient Directory</p>
              <p className="text-sm font-semibold text-teal-600">Active Records Ready</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Appointments & Action Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
            <p className="text-xs text-slate-500">Latest scheduled and attended hospital visits</p>
          </div>
          <Link
            to="/appointments"
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            All Appointments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No recent appointments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {appt.patient?.name || `Patient #${appt.patientId}`}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {appt.doctor?.name || `Doctor #${appt.doctorId}`}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs">
                      {formatDateTime(appt.appointmentDate)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate text-xs">
                      {appt.reason || 'General Consultation'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
