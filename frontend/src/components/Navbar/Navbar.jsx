import React from 'react'
import { Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatRole } from '../../utils/formatters'
import { Button } from '../Button/Button'

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
          Hospital Clinical Portal
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
              <p className="text-xs text-slate-400 mt-1">{formatRole(user.role)}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={LogOut}
              onClick={logout}
              title="Sign out of system"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
