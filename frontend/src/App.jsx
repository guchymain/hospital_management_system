import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { PageLoader } from './components/Loading/Spinner'

import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Patients } from './pages/Patients'
import { PatientDetails } from './pages/Patients/PatientDetails'
import { Doctors } from './pages/Doctors'
import { Departments } from './pages/Departments'
import { Appointments } from './pages/Appointments'
import { MedicalRecords } from './pages/MedicalRecords'
import { Prescriptions } from './pages/Prescriptions'
import { Users } from './pages/Users'

// Role-aware protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth()

  if (loading) {
    return <PageLoader message="Verifying session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />

      {/* Protected Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Patients & Details */}
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetails />} />

        {/* Appointments */}
        <Route path="appointments" element={<Appointments />} />

        {/* Doctors & Departments */}
        <Route path="doctors" element={<Doctors />} />
        <Route path="departments" element={<Departments />} />

        {/* Clinical Modules (Admin, Doctor, Nurse) */}
        <Route
          path="medical-records"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="prescriptions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />

        {/* Administration (Admin only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
