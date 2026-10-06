import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/ErrorMessage/Alert'
import { DataTable } from '../../components/Table/DataTable'
import { StatusBadge } from '../../components/Badge/StatusBadge'
import { UserModal } from './UserModal'

export const Users = () => {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/users')
      setUsers(response.data?.users || [])
    } catch (err) {
      setError(err.displayMessage || 'Failed to load staff users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (u) => {
    setSelectedUser(u)
    setIsModalOpen(true)
  }

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) {
      setError('You cannot delete your own currently logged-in administrator account.')
      return
    }

    if (!window.confirm(`Are you sure you want to delete user account "${u.name}" (${u.email})?`)) {
      return
    }

    setDeletingId(u.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/users/${u.id}`)
      setSuccess(`User "${u.name}" deleted successfully`)
      fetchUsers()
    } catch (err) {
      setError(err.displayMessage || 'Could not delete user account')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-snug">
              {row.name} {row.id === currentUser?.id && <span className="text-xs font-normal text-teal-600">(You)</span>}
            </p>
            <p className="text-xs text-slate-400">User #{row.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'System Role',
      accessor: 'role',
      render: (row) => <StatusBadge status={row.role} />
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <p className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {row.email}
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {row.phone}
          </p>
        </div>
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
            icon={Edit2}
            onClick={() => handleEdit(row)}
            title="Edit User"
          >
            Edit
          </Button>
          {row.id !== currentUser?.id && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              loading={deletingId === row.id}
              onClick={() => handleDelete(row)}
              title="Delete User"
            >
              Delete
            </Button>
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
          <h1 className="text-2xl font-bold text-slate-900">Hospital Staff & User Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administrator management of hospital roles, access permissions, and account credentials
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          Register Staff User
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No staff users found."
      />

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSaved={() => {
            fetchUsers()
            setSuccess(selectedUser ? 'User updated successfully' : 'New staff user created successfully')
          }}
        />
      )}
    </div>
  )
}
