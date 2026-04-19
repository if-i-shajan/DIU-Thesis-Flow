import React, { useEffect, useState } from 'react'
import { useAuthStore, useNotificationStore } from '../context/store'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { notificationService } from '../services/notificationService'
import { BrandLogo } from './BrandLogo'

export const Navigation = () => {
    const navigate = useNavigate()
    const { user, profile, setUser, setProfile } = useAuthStore()
    const { unreadCount, setNotifications, setUnreadCount } = useNotificationStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!user?.uid) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        const unsubscribe = notificationService.subscribeToNotifications(user.uid, (items) => {
            setNotifications(items)
            setUnreadCount(items.filter((item) => !item.is_read).length)
        })

        return () => unsubscribe()
    }, [user?.uid, setNotifications, setUnreadCount])

    const handleLogout = async () => {
        await authService.logout()
        setUser(null)
        setProfile(null)
        navigate('/login')
    }

    const navLinks = {
        student: [
            { label: 'Dashboard', path: '/student/dashboard' },
            { label: 'Projects', path: '/student/projects' },
            { label: 'Supervisors', path: '/student/supervisors' },
            { label: 'My Requests', path: '/student/requests' },
        ],
        supervisor: [
            { label: 'Dashboard', path: '/supervisor/dashboard' },
            { label: 'Requests', path: '/supervisor/requests' },
            { label: 'Projects', path: '/supervisor/projects' },
        ],
        admin: [
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Projects', path: '/admin/projects' },
        ],
    }

    const getCurrentLinks = () => {
        return navLinks[profile?.role] || []
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <BrandLogo showSubtitle={false} />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {getCurrentLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side - Notifications and User Menu */}
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                {/* Notifications */}
                                <Link
                                    to="/notifications"
                                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <User className="w-6 h-6 text-gray-700" />
                                        <span className="text-sm font-medium text-gray-900 hidden sm:inline">
                                            {profile?.full_name || 'User'}
                                        </span>
                                    </button>

                                    <div className="absolute right-0 w-48 bg-white rounded-lg shadow-md py-2 hidden group-hover:block">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {!user && (
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                                Login
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && user && (
                    <div className="md:hidden pb-4 flex flex-col gap-2">
                        {getCurrentLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded hover:bg-gray-50"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
