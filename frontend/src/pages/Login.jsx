import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/Form/Input'
import { Button } from '../components/Button/Button'
import { Alert } from '../components/ErrorMessage/Alert'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }

    const params = new URLSearchParams(location.search)
    if (params.get('expired') === 'true') {
      setInfoMessage('Your session has expired. Please sign in again.')
    }
  }, [isAuthenticated, location.search, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.displayMessage || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (roleEmail, rolePassword) => {
    setEmail(roleEmail)
    setPassword(rolePassword)
    setError('')
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Sign In</h2>
      <p className="text-sm text-slate-500 mb-6">Enter your hospital credentials to access the system</p>

      {infoMessage && (
        <Alert type="warning" message={infoMessage} onClose={() => setInfoMessage('')} className="mb-4" />
      )}

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="name@hospital.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill Section */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          <KeyRound className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Role Quick-Fill:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials('admin@hospital.com', 'Admin@123')}
            className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <span className="font-semibold text-slate-800 block">Admin</span>
            <span className="text-slate-500 block truncate">admin@hospital.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('doctor.smith@hospital.com', 'Doctor@123')}
            className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <span className="font-semibold text-slate-800 block">Doctor</span>
            <span className="text-slate-500 block truncate">doctor.smith@hospital.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('nurse@hospital.com', 'Nurse@123')}
            className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <span className="font-semibold text-slate-800 block">Nurse</span>
            <span className="text-slate-500 block truncate">nurse@hospital.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('receptionist@hospital.com', 'Receptionist@123')}
            className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <span className="font-semibold text-slate-800 block">Receptionist</span>
            <span className="text-slate-500 block truncate">receptionist@hospital.com</span>
          </button>
        </div>
      </div>
    </div>
  )
}
