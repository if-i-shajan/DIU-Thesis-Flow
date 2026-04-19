import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { notificationService } from '../services/notificationService'
import { Container, Section } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Trash2, CheckCircle } from 'lucide-react'

export const NotificationsPage = () => {
    const { user } = useAuthStore()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchNotifications()
    }, [user])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const result = await notificationService.getNotifications(user.uid)
            if (result.success) {
                setNotifications(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId)
            setNotifications(
                notifications.map((n) =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            )
        } catch (err) {
            setError('Failed to mark notification as read')
        }
    }

    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId)
            setNotifications(notifications.filter((n) => n.id !== notificationId))
        } catch (err) {
            setError('Failed to delete notification')
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'request':
                return 'info'
            case 'accepted':
                return 'success'
            case 'rejected':
                return 'danger'
            default:
                return 'info'
        }
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section title="Notifications" subtitle="Stay updated with your requests and updates">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`flex justify-between items-start ${!notification.is_read ? 'bg-blue-50 border-2 border-blue-200' : ''
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge variant={getTypeColor(notification.type)}>
                                                {notification.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No notifications yet</p>
                        </div>
                    )}
                </Section>
            </Container>
        </div>
    )
}
