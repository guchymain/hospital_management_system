import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  FileText,
  Pill,
  ShieldCheck,
  Activity,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { StatusBadge } from '../Badge/StatusBadge'

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth()

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      to: '/patients',
      label: 'Patients',
      icon: Users,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      to: '/appointments',
      label: 'Appointments',
      icon: CalendarDays,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      to: '/doctors',
      label: 'Doctors',
      icon: UserCheck,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      to: '/departments',
      label: 'Departments',
      icon: Building2,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      to: '/medical-records',
      label: 'Medical Records',
      icon: FileText,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      to: '/prescriptions',
      label: 'Prescriptions',
      icon: Pill,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      to: '/users',
      label: 'Staff Users',
      icon: ShieldCheck,
      roles: ['admin']
    }
  ]

  const filteredNavItems = navItems.filter((item) => hasRole(...item.roles))

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <span>HealthCare HMS</span>
          </NavLink>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <div className="mt-0.5">
                  <StatusBadge status={user.role} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-4 text-xs text-slate-400 text-center">
          Hospital Management API v1.0
        </div>
      </aside>
    </>
  )
}
