import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospital_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercept responses for auth errors & error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Do not redirect if the failure happened during login
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        localStorage.removeItem('hospital_token')
        localStorage.removeItem('hospital_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true'
        }
      }
    }

    // Attach structured error message for convenience
    const backendMessage = error.response?.data?.message
    const validationErrors = error.response?.data?.errors
    
    let displayMessage = backendMessage || error.message || 'An unexpected error occurred'
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      displayMessage = validationErrors.map((e) => e.message).join(', ')
    }
    
    error.displayMessage = displayMessage
    return Promise.reject(error)
  }
)

export default api
