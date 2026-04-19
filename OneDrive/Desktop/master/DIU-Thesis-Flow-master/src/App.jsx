import '@/styles/globals.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { useAuth } from './hooks/useAuth'

// Components
import { Navigation } from './components/Navigation'
import { Alert } from './components/Alert'
import { ProtectedRoute } from './utils/ProtectedRoute'

// Pages





import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentProjectsPage } from './pages/StudentProjectsPage'
import { StudentSupervisorsPage } from './pages/StudentSupervisorsPage'
import { StudentRequestsPage } from './pages/StudentRequestsPage'
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage'
import { SupervisorRequestsPage } from './pages/SupervisorRequestsPage'
import { SupervisorProjectsPage } from './pages/SupervisorProjectsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

function App() {
    const { error, profile } = useAuthStore()
    useAuth() // Initialize auth

    const dashboardPathByRole = {
        student: '/student/dashboard',
        supervisor: '/supervisor/dashboard',
        admin: '/admin/dashboard',
    }

    const defaultDashboardPath = dashboardPathByRole[profile?.role] || '/'

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                {error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                        <Alert type="error" message={error} />
                    </div>
                )}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Student Routes */}
                    <Route
                        path="/student/dashboard"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <StudentDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Navigate to={defaultDashboardPath} replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Navigate to={defaultDashboardPath} replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/projects"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <StudentProjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/supervisors"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <StudentSupervisorsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/requests"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <StudentRequestsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Supervisor Routes */}
                    <Route
                        path="/supervisor/dashboard"
                        element={
                            <ProtectedRoute requiredRole="supervisor">
                                <SupervisorDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/supervisor/requests"
                        element={
                            <ProtectedRoute requiredRole="supervisor">
                                <SupervisorRequestsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/supervisor/projects"
                        element={
                            <ProtectedRoute requiredRole="supervisor">
                                <SupervisorProjectsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Shared Routes */}
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
