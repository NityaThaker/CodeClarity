import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import StudentDashboard from './pages/student/Dashboard'
import AssignmentPage from './pages/student/AssignmentPage'
import ResultsPage from './pages/student/ResultsPage'
import Submissions from './pages/student/Submissions'
import Progress from './pages/student/Progress'
import Leaderboard from './pages/student/Leaderboard'

import InstructorDashboard from './pages/instructor/Dashboard'
import CreateAssignment from './pages/instructor/CreateAssignment'
import InstructorAnalytics from './pages/instructor/Analytics'
import Students from './pages/instructor/Students'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/assignments/:id" element={<ProtectedRoute role="student"><AssignmentPage /></ProtectedRoute>} />
      <Route path="/results/:submissionId" element={<ProtectedRoute role="student"><ResultsPage /></ProtectedRoute>} />
      <Route path="/submissions" element={<ProtectedRoute role="student"><Submissions /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute role="student"><Progress /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute role="student"><Leaderboard /></ProtectedRoute>} />

      {/* Instructor */}
      <Route path="/instructor" element={<ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>} />
      <Route path="/instructor/create" element={<ProtectedRoute role="instructor"><CreateAssignment /></ProtectedRoute>} />
      <Route path="/instructor/analytics" element={<ProtectedRoute role="instructor"><InstructorAnalytics /></ProtectedRoute>} />
      <Route path="/instructor/students" element={<ProtectedRoute role="instructor"><Students /></ProtectedRoute>} />

      <Route path="/" element={
        user?.role === 'instructor' ? <Navigate to="/instructor" replace /> : <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}