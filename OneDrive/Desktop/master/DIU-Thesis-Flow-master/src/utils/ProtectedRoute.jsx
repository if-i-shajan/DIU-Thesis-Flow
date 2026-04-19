import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, profile, isLoading } = useAuthStore()

    if (isLoading) {
        return <LoadingSpinner fullPage />
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (requiredRole && profile?.role !== requiredRole) {
        return <Navigate to="/" />
    }

    return children
}
