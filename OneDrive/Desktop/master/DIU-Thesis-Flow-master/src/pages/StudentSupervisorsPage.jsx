import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { supervisorService } from '../services/supervisorService'
import { requestService } from '../services/requestService'
import { projectService } from '../services/projectService'
import { Container, Section, Grid } from '../components/Layout'
import { SupervisorCard } from '../components/SupervisorCard'
import { Input, Select } from '../components/FormInputs'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Mail, Phone, Search } from 'lucide-react'

export const StudentSupervisorsPage = () => {
    const { user } = useAuthStore()
    const [supervisors, setSupervisors] = useState([])
    const [filteredSupervisors, setFilteredSupervisors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [requestStatuses, setRequestStatuses] = useState({})
    const [selectedSupervisor, setSelectedSupervisor] = useState(null)
    const [selectedSupervisorProjects, setSelectedSupervisorProjects] = useState([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    const departments = ['CS', 'SE', 'IT', 'AI', 'DS']

    useEffect(() => {
        fetchSupervisors()
    }, [])

    useEffect(() => {
        filterSupervisors()
    }, [supervisors, searchTerm, selectedDepartment])

    const fetchSupervisors = async () => {
        setLoading(true)
        try {
            const result = await supervisorService.getSupervisors()
            if (result.success) {
                setSupervisors(result.data)

                // Batch fetch all request statuses in one query (much faster!)
                if (result.data.length > 0) {
                    const supervisorIds = result.data.map((s) => s.id)
                    const statusResult = await requestService.getRequestStatusesBatch(user.uid, supervisorIds)
                    if (statusResult.success) {
                        setRequestStatuses(statusResult.data)
                    }
                }

                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to load supervisors')
        } finally {
            setLoading(false)
        }
    }

    const filterSupervisors = () => {
        let filtered = supervisors

        if (selectedDepartment) {
            filtered = filtered.filter((s) => s.department === selectedDepartment)
        }

        if (searchTerm) {
            filtered = filtered.filter((s) =>
                s.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.research_area.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredSupervisors(filtered)
    }

    const handleRequest = async (supervisorId) => {
        try {
            const selectedSupervisor = supervisors.find((s) => s.id === supervisorId)
            const maxCapacity = Number(selectedSupervisor?.max_capacity ?? 0)
            const assignedCount = Number(selectedSupervisor?.assigned_count ?? 0)

            if (maxCapacity > 0 && assignedCount >= maxCapacity) {
                setError('Supervisor is not accepting new students')
                return
            }

            const result = await requestService.sendRequest(user.uid, supervisorId)

            if (result.success) {
                setRequestStatuses({
                    ...requestStatuses,
                    [supervisorId]: 'pending',
                })
                setSuccessMessage('Request sent successfully!')
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to send request')
        }
    }

    const parseTags = (value) => {
        if (!value) return []
        if (Array.isArray(value)) return value.filter(Boolean)
        return String(value)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }

    const handleViewDetails = async (supervisor) => {
        setDetailsLoading(true)
        setSelectedSupervisor(supervisor)
        setSelectedSupervisorProjects([])

        try {
            const [detailResult, projectsResult] = await Promise.all([
                supervisorService.getSupervisorById(supervisor.id),
                projectService.getProjects(),
            ])

            if (detailResult.success && detailResult.data) {
                setSelectedSupervisor(detailResult.data)
            }

            if (projectsResult.success) {
                const projects = (projectsResult.data || []).filter((project) => {
                    const supervisorId = project.supervisor_id?.id || project.supervisor_id
                    const createdById = project.created_by?.id || project.created_by
                    return (
                        supervisorId === supervisor.id ||
                        createdById === (supervisor.user_id || supervisor.id)
                    )
                })
                setSelectedSupervisorProjects(projects)
            }
        } finally {
            setDetailsLoading(false)
        }
    }

    const getRequestBlockReason = (supervisor) => {
        if (!supervisor) return ''
        const maxCapacity = Number(supervisor.max_capacity ?? 0)
        const assignedCount = Number(supervisor.assigned_count ?? 0)
        const isFull = maxCapacity > 0 && assignedCount >= maxCapacity
        const existingStatus = requestStatuses[supervisor.id]

        if (isFull) return 'Supervisor is not accepting new students'
        if (existingStatus) return `Request already ${existingStatus}`
        return ''
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section
                    title="Find Your Supervisor"
                    subtitle="Browse supervisor profiles and send requests"
                >
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6">
                            <Alert type="success" message={successMessage} />
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4 md:flex gap-4 md:space-y-0">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search supervisors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <Select
                            options={[
                                { label: 'All Departments', value: '' },
                                ...departments.map((dept) => ({ label: dept, value: dept })),
                            ]}
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full md:w-48"
                        />
                    </div>

                    {/* Supervisors Grid */}
                    {filteredSupervisors.length > 0 ? (
                        <Grid columns={3}>
                            {filteredSupervisors.map((supervisor) => {
                                const maxCapacity = Number(supervisor.max_capacity ?? 0)
                                const assignedCount = Number(supervisor.assigned_count ?? 0)
                                const isFull = maxCapacity > 0 && assignedCount >= maxCapacity
                                const existingStatus = requestStatuses[supervisor.id]

                                return (
                                    <SupervisorCard
                                        key={supervisor.id}
                                        supervisor={supervisor}
                                        onRequest={() => handleRequest(supervisor.id)}
                                        onViewDetails={() => handleViewDetails(supervisor)}
                                        requestDisabled={Boolean(existingStatus) || isFull}
                                        requestDisabledMessage={
                                            isFull
                                                ? 'Supervisor is not accepting new students'
                                                : existingStatus
                                                    ? `Request already ${existingStatus}`
                                                    : ''
                                        }
                                    />
                                )
                            })}
                        </Grid>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No supervisors found</p>
                        </div>
                    )}
                </Section>
            </Container>

            <Modal
                isOpen={Boolean(selectedSupervisor)}
                onClose={() => setSelectedSupervisor(null)}
                title="Supervisor Profile"
                size="lg"
            >
                {selectedSupervisor && (
                    <div className="space-y-4">
                        {detailsLoading && (
                            <div className="rounded-lg bg-blue-50 p-2 text-center text-sm font-medium text-blue-700">
                                Loading full advisor profile...
                            </div>
                        )}

                        <div className="rounded-xl bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                    {selectedSupervisor.user_profiles?.avatar_url ? (
                                        <img
                                            src={selectedSupervisor.user_profiles.avatar_url}
                                            alt={selectedSupervisor.user_profiles?.full_name || 'Advisor'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        (selectedSupervisor.user_profiles?.full_name || 'S')
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((part) => part[0])
                                            .join('')
                                            .toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-gray-900">{selectedSupervisor.user_profiles?.full_name || 'Supervisor'}</p>
                                    <p className="text-sm text-gray-600">{selectedSupervisor.designation || 'Faculty Member'}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {selectedSupervisor.department || 'Department N/A'}
                                        </span>
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                            {selectedSupervisor.research_area || 'Research area not set'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{Number(selectedSupervisor.years_of_experience || 0)} years</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Max Capacity</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{Number(selectedSupervisor.max_capacity ?? 5)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Available Slots</p>
                                <p className={`mt-1 text-lg font-bold ${Number(selectedSupervisor.available_slots ?? 0) > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {Number(selectedSupervisor.available_slots ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Project Ideas</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{selectedSupervisorProjects.length}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500">Contact</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span>{selectedSupervisor.user_profiles?.email || 'Email not available'}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span>{selectedSupervisor.user_profiles?.phone || '+8801XXXXXXXXX'}</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 mb-2">Research Areas</p>
                            <div className="flex flex-wrap gap-2">
                                {parseTags(selectedSupervisor.research_area).length > 0 ? (
                                    parseTags(selectedSupervisor.research_area).map((tag) => (
                                        <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-600">No research areas provided.</span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 mb-2">Preferred Project Domains</p>
                            <div className="flex flex-wrap gap-2">
                                {parseTags(selectedSupervisor.preferred_project_domains).length > 0 ? (
                                    parseTags(selectedSupervisor.preferred_project_domains).map((tag) => (
                                        <span key={tag} className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-600">No preferred domains provided.</span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 mb-2">Short Bio</p>
                            <p className="text-sm text-gray-700">
                                {selectedSupervisor.user_profiles?.bio || 'No bio provided yet.'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 mb-2">Project Ideas by Advisor</p>
                            {selectedSupervisorProjects.length > 0 ? (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {selectedSupervisorProjects.map((project) => (
                                        <div key={project.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                    {project.category || 'General'}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">{project.description}</p>
                                            {project.video_link && (
                                                <a
                                                    href={project.video_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    Watch project video
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No project ideas available yet.</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                className="mr-2"
                                disabled={Boolean(getRequestBlockReason(selectedSupervisor))}
                                onClick={async () => {
                                    const reason = getRequestBlockReason(selectedSupervisor)
                                    if (reason) {
                                        setError(reason)
                                        return
                                    }

                                    await handleRequest(selectedSupervisor.id)
                                }}
                            >
                                Send Request
                            </Button>
                            <Button variant="secondary" onClick={() => setSelectedSupervisor(null)}>
                                Close
                            </Button>
                        </div>
                        {getRequestBlockReason(selectedSupervisor) && (
                            <p className="text-right text-xs font-semibold text-red-600">
                                {getRequestBlockReason(selectedSupervisor)}
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
