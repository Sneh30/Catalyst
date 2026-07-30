import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeAuditor from './pages/ResumeAuditor'
import JobScanner from './pages/JobScanner'
import ResumeGenerator from './pages/ResumeGenerator'
import ContentStudio from './pages/ContentStudio'
import WeeklyTracker from './pages/WeeklyTracker'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={localStorage.getItem('token') ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
      <Route path="/register" element={localStorage.getItem('token') ? <Navigate to="/" replace /> : <Register setUser={setUser} />} />
      <Route path="/" element={<ProtectedRoute><Layout user={user} setUser={setUser} /></ProtectedRoute>}>
        <Route index element={<Dashboard user={user} />} />
        <Route path="resume" element={<ResumeAuditor user={user} />} />
        <Route path="jobs" element={<JobScanner user={user} />} />
        <Route path="jobs/generate/:jobId" element={<ResumeGenerator user={user} />} />
        <Route path="content" element={<ContentStudio user={user} />} />
        <Route path="tracker" element={<WeeklyTracker user={user} />} />
        <Route path="profile" element={<Profile user={user} setUser={setUser} />} />
      </Route>
    </Routes>
  )
}
