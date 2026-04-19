import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { requestService } from '../services/requestService'
import { Container, Section, Grid } from '../components/Layout'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

export const StudentRequestsPage = () => {
    const { user } = useAuthStore()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [user])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const result = await requestService.getRequestsForStudent(user.uid)
            if (result.success) {
                setRequests(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to load requests')
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />
            default:
                return null
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'success'
            case 'rejected':
                return 'danger'
            case 'pending':
                return 'warning'
            default:
                return 'info'
        }
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section
                    title="My Supervisor Requests"
                    subtitle="Track the status of your supervisor requests"
                >
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <Card key={request.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {request.supervisors?.user_profiles?.full_name || 'Unknown Supervisor'}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(request.status)}
                                                <Badge variant={getStatusColor(request.status)}>
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Research: {request.supervisors?.research_area}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Sent on {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">No requests yet</p>
                            <p className="text-gray-600">
                                <a href="/student/supervisors" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Browse supervisors
                                </a>
                                {' '}to send your first request
                            </p>
                        </div>
                    )}
                </Section>
            </Container>
        </div>
    )
}
