import '@/styles/globals.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/store'
import { useAuth } from './hooks/useAuth'

// Components
import { Navigation } from './components/Navigation'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ProtectedRoute } from './utils/ProtectedRoute'

// Pages



import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentProjectsPage } from './pages/StudentProjectsPage'
import { StudentSupervisorsPage } from './pages/StudentSupervisorsPage'
import { StudentRequestsPage } from './pages/StudentRequestsPage'
import { SupervisorRequestsPage } from './pages/SupervisorRequestsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

function App() {
    const { isLoading } = useAuthStore()
    useAuth() // Initialize auth

    if (isLoading) {
        return <LoadingSpinner fullPage />
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Student Routes */}
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
                        path="/supervisor/requests"
                        element={
                            <ProtectedRoute requiredRole="supervisor">
                                <SupervisorRequestsPage />
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
