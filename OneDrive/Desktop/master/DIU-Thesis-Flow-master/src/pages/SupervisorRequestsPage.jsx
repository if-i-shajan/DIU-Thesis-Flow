import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { requestService } from '../services/requestService'
import { notificationService } from '../services/notificationService'
import { Container, Section, Grid } from '../components/Layout'
import { Card, CardHeader, CardBody, CardFooter } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Modal } from '../components/Modal'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export const SupervisorRequestsPage = () => {
    const { user } = useAuthStore()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState('')
    const [selectedRequest, setSelectedRequest] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            // Get supervisor ID from user
            const result = await requestService.getRequestsForSupervisor(user.uid)
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

    const handleRequest = async (requestId, status) => {
        try {
            const result = await requestService.updateRequest(requestId, status)
            if (result.success) {
                setRequests(
                    requests.map((req) =>
                        req.id === requestId ? { ...req, status } : req
                    )
                )
                setMessage(`Request ${status} successfully`)
                setTimeout(() => setMessage(''), 3000)

                // Create notification for student
                await notificationService.createNotification(
                    result.data[0].student_id,
                    `Your supervisor request has been ${status}`,
                    'request_update'
                )
            }
        } catch (err) {
            setError('Failed to update request')
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

    const formatDateTime = (value) => {
        if (!value) return 'Just now'
        const parsed = value?.toDate ? value.toDate() : new Date(value)
        if (Number.isNaN(parsed.getTime())) return 'Just now'
        return parsed.toLocaleString()
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section title="Student Requests" subtitle="Manage student supervisor requests">
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {message && (
                        <div className="mb-6">
                            <Alert type="success" message={message} />
                        </div>
                    )}

                    {requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <Card key={request.id} className="flex justify-between items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {request.students?.user_profiles?.full_name || 'Unknown Student'}
                                            </h3>
                                            <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'accepted' ? 'success' : 'danger'}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Department: {request.students?.department}
                                        </p>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedRequest(request)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleRequest(request.id, 'accepted')}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRequest(request.id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No requests yet</p>
                        </div>
                    )}
                </Section>
            </Container>

            <Modal
                isOpen={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
                title="Student Profile & Request Details"
                size="xl"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-[#F7F9FF] p-4">
                            <p className="text-lg font-bold text-[#1A2756]">
                                {selectedRequest.students?.user_profiles?.full_name || 'Student'}
                            </p>
                            <p className="text-sm text-[#6070A2]">{selectedRequest.students?.user_profiles?.email || 'Email unavailable'}</p>
                            <p className="text-sm text-[#6070A2]">Phone: {selectedRequest.students?.user_profiles?.phone || '+8801XXXXXXXXX'}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Student ID</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{selectedRequest.students?.user_profiles?.student_id || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Department</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{selectedRequest.students?.department || selectedRequest.students?.user_profiles?.department || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Request Status</p>
                                <p className="mt-1 font-semibold capitalize text-[#1A2756]">{selectedRequest.status}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Submitted</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{formatDateTime(selectedRequest.created_at)}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#DCE4FF] p-3">
                            <p className="text-xs text-[#6B79A7]">Request Details</p>
                            <p className="mt-1 text-sm text-[#334169]">Project Interest: {selectedRequest.project_interest || 'General supervision request'}</p>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
