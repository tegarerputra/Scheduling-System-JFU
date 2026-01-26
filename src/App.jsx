import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import useStore from './store/useStore'
import { useEffect } from 'react'

function ProtectedRoute({ children }) {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { user, setUser } = useStore()

  // Session restoration is now handled synchronously in useStore.js to prevent race conditions

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
