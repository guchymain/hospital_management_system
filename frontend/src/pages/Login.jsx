import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, ShieldAlert } from 'lucide-react'
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

      <div className="mt-8 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Hospital personnel accounts are provisioned exclusively by Hospital Administrators. Public self-registration is disabled for clinical data security and regulatory compliance.
        </p>
      </div>
    </div>
  )
}
