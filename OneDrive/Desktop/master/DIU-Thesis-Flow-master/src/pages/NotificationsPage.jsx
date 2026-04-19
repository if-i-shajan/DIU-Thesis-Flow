import React, { useState, useEffect } from 'react'
import { useAuthStore, useNotificationStore } from '../context/store'
import { notificationService } from '../services/notificationService'
import { Container, Section } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Trash2, CheckCircle } from 'lucide-react'

export const NotificationsPage = () => {
    const { user } = useAuthStore()
    const {
        notifications,
        setNotifications,
        setUnreadCount,
    } = useNotificationStore()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user?.uid) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        const unsubscribe = notificationService.subscribeToNotifications(user.uid, (items) => {
            setNotifications(items)
            setUnreadCount(items.filter((item) => !item.is_read).length)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user?.uid, setNotifications, setUnreadCount])

    const formatDateTime = (value) => {
        if (!value) return 'Just now'
        const parsed = value?.toDate ? value.toDate() : new Date(value)
        if (Number.isNaN(parsed.getTime())) return 'Just now'
        return parsed.toLocaleString()
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            const result = await notificationService.markAsRead(notificationId)
            if (!result.success) {
                setError(result.error || 'Failed to mark notification as read')
                return
            }
        } catch (err) {
            setError('Failed to mark notification as read')
        }
    }

    const handleDelete = async (notificationId) => {
        try {
            const result = await notificationService.deleteNotification(notificationId)
            if (!result.success) {
                setError(result.error || 'Failed to delete notification')
                return
            }
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
                                                    {formatDateTime(notification.created_at)}
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
