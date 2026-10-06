import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Building2, Users } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { PageLoader } from '../../components/Loading/Spinner'
import { DepartmentModal } from './DepartmentModal'

export const Departments = () => {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin')

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchDepartments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/departments')
      setDepartments(response.data?.departments || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreate = () => {
    setSelectedDept(null)
    setIsModalOpen(true)
  }

  const handleEdit = (dept) => {
    setSelectedDept(dept)
    setIsModalOpen(true)
  }

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete department "${dept.name}"?`)) {
      return
    }

    setDeletingId(dept.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/departments/${dept.id}`)
      setSuccess(`Department "${dept.name}" deleted successfully`)
      fetchDepartments()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete department')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Departments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical specialties, surgical divisions, and departmental doctor allocations
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Add Department
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <PageLoader message="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-base font-semibold text-slate-700">No departments configured</p>
          <p className="text-sm text-slate-400 mt-1">Create the first hospital department using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {dept.doctorCount || 0} {dept.doctorCount === 1 ? 'Doctor' : 'Doctors'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mt-3 leading-relaxed">
                  {dept.description || 'No description recorded.'}
                </p>

                {dept.doctors && dept.doctors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Assigned Specialists
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.doctors.map((doc) => (
                        <span
                          key={doc.id}
                          className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                        >
                          {doc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleEdit(dept)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    loading={deletingId === dept.id}
                    onClick={() => handleDelete(dept)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          department={selectedDept}
          onSaved={() => {
            fetchDepartments()
            setSuccess(selectedDept ? 'Department updated successfully' : 'Department created successfully')
          }}
        />
      )}
    </div>
  )
}
