import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Bell,
    Check,
    Edit,
    Mail,
    Phone,
    PlusCircle,
    Settings,
    Trash2,
    Users,
    X,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Input, Select, Textarea } from '../components/FormInputs'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import {
    RequestStatusBadge,
    SupervisorDashboardCard,
    SupervisorTag,
} from '../components/supervisorDashboard/SupervisorDashboardCard'
import { SupervisorProfileEditModal } from '../components/supervisorDashboard/SupervisorProfileEditModal'
import { useAuthStore } from '../context/store'
import { notificationService } from '../services/notificationService'
import { projectService } from '../services/projectService'
import { requestService } from '../services/requestService'
import { supervisorDashboardService } from '../services/supervisorDashboardService'

const categories = ['AI/ML', 'Web Development', 'Mobile Development', 'IoT', 'Data Science', 'Security']

const isYouTubeLink = (value) => {
    try {
        const parsed = new URL(value)
        return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')
    } catch {
        return false
    }
}

const initialsFromName = (name = '') => {
    const parts = String(name).trim().split(' ').filter(Boolean)
    const first = parts[0]?.[0] || 'S'
    const second = parts[1]?.[0] || ''
    return `${first}${second}`.toUpperCase()
}

const formatDateTime = (value) => {
    if (!value) return 'Just now'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Just now'
    return parsed.toLocaleString()
}

const STATUS_STYLES = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    request: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    request_update: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export const SupervisorDashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isProjectSubmitting, setIsProjectSubmitting] = useState(false)
    const [editingProjectId, setEditingProjectId] = useState('')
    const [capacityInput, setCapacityInput] = useState('5')
    const [selectedRequest, setSelectedRequest] = useState(null)

    const [dashboard, setDashboard] = useState({
        profile: null,
        supervisor: null,
        projects: [],
        pendingRequests: [],
        acceptedGroups: [],
        timeline: [],
        notifications: [],
    })

    const [projectForm, setProjectForm] = useState({
        title: '',
        description: '',
        category: categories[0],
        video_link: '',
    })

    useEffect(() => {
        if (!user?.uid) return

        let stopNotifications = () => {}

        const loadDashboard = async () => {
            setLoading(true)
            const result = await supervisorDashboardService.getSupervisorDashboard(user.uid)
            if (!result.success) {
                setError(result.error || 'Failed to load supervisor dashboard.')
                setLoading(false)
                return
            }

            setDashboard(result.data)
            setError('')
            setLoading(false)

            stopNotifications = supervisorDashboardService.subscribeToNotifications(user.uid, (notifications) => {
                setDashboard((prev) => ({ ...prev, notifications }))
            })
        }

        loadDashboard()

        return () => {
            stopNotifications()
        }
    }, [user?.uid])

    const profile = dashboard.profile || {}
    const supervisor = dashboard.supervisor || {}

    const researchTags = useMemo(() => {
        const raw = supervisor.research_area
        if (!raw) return ['AI / Machine Learning', 'Data Science', 'Cybersecurity']
        return String(raw)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }, [supervisor.research_area])

    const preferredDomains =
        Array.isArray(supervisor.preferred_project_domains) && supervisor.preferred_project_domains.length
            ? supervisor.preferred_project_domains
            : ['Web Development', 'Mobile Apps', 'IoT']

    const maxCapacity = Number(supervisor.max_capacity ?? 5)
    const assignedCount = Number(supervisor.assigned_count ?? dashboard.acceptedGroups.length)
    const availableSlots = Math.max(0, maxCapacity - assignedCount)
    const capacityUsage = maxCapacity > 0 ? Math.min(100, (assignedCount / maxCapacity) * 100) : 0

    useEffect(() => {
        setCapacityInput(String(maxCapacity || 1))
    }, [maxCapacity])

    const reloadDashboard = async () => {
        const refreshed = await supervisorDashboardService.getSupervisorDashboard(user.uid)
        if (refreshed.success) {
            setDashboard(refreshed.data)
        }
    }

    const handleProjectFormChange = (event) => {
        const { name, value } = event.target
        setProjectForm((prev) => ({ ...prev, [name]: value }))
    }

    const resetProjectForm = () => {
        setProjectForm({
            title: '',
            description: '',
            category: categories[0],
            video_link: '',
        })
        setEditingProjectId('')
    }

    const submitProject = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!projectForm.title.trim() || !projectForm.description.trim()) {
            setError('Title and description are required for project ideas.')
            return
        }

        if (!isYouTubeLink(projectForm.video_link.trim())) {
            setError('Please provide a valid YouTube video link.')
            return
        }

        setIsProjectSubmitting(true)

        const payload = {
            title: projectForm.title.trim(),
            description: projectForm.description.trim(),
            category: projectForm.category,
            video_link: projectForm.video_link.trim(),
            status: 'available',
            created_by: user.uid,
            supervisor_id: supervisor.id || user.uid,
        }

        const result = editingProjectId
            ? await projectService.updateProject(editingProjectId, payload)
            : await projectService.createProject(payload)

        setIsProjectSubmitting(false)

        if (!result.success) {
            setError(result.error || 'Failed to save project idea.')
            return
        }

        setSuccess(editingProjectId ? 'Project updated successfully.' : 'Project added successfully.')
        resetProjectForm()
        await reloadDashboard()
    }

    const startEditProject = (project) => {
        setEditingProjectId(project.id)
        setProjectForm({
            title: project.title || '',
            description: project.description || '',
            category: project.category || categories[0],
            video_link: project.video_link || '',
        })
    }

    const deleteProject = async (projectId) => {
        const result = await projectService.deleteProject(projectId)
        if (!result.success) {
            setError(result.error || 'Failed to delete project.')
            return
        }

        setSuccess('Project deleted successfully.')
        await reloadDashboard()
    }

    const handleRequestAction = async (request, status) => {
        if (status === 'accepted' && availableSlots <= 0) {
            setError('No available supervision slots. Increase capacity first.')
            return
        }

        const result = await requestService.updateRequest(request.id, status)
        if (!result.success) {
            setError(result.error || 'Failed to update request status.')
            return
        }

        await notificationService.createNotification(
            request.student_id,
            `Your request to ${profile.full_name || 'the supervisor'} has been ${status}.`,
            status === 'accepted' ? 'success' : 'warning',
        )

        setSuccess(`Request ${status} successfully.`)
        await reloadDashboard()
    }

    const handleCapacityUpdate = async () => {
        setError('')
        setSuccess('')

        const parsed = Number(capacityInput)
        if (!Number.isFinite(parsed) || parsed < 1) {
            setError('Maximum capacity must be at least 1.')
            return
        }

        const result = await supervisorDashboardService.updateCapacity(
            supervisor.id || user.uid,
            parsed,
        )

        if (!result.success) {
            setError(result.error || 'Failed to update capacity.')
            return
        }

        setSuccess('Supervision capacity updated successfully.')
        await reloadDashboard()
    }

    const handleSaveProfile = async (payload) => {
        setIsSaving(true)
        const result = await supervisorDashboardService.updateProfile(
            user.uid,
            supervisor.id || user.uid,
            payload,
        )
        setIsSaving(false)

        if (!result.success) {
            return { success: false, error: result.error }
        }

        await reloadDashboard()
        return { success: true }
    }

    const openEmail = (email, name) => {
        if (!email) return
        const subject = encodeURIComponent('ThesisFlow: Supervisor Follow-up')
        const body = encodeURIComponent(`Hello ${name || 'Student'},\n\nPlease review the latest update regarding your thesis request.\n\nRegards,\n${profile.full_name || 'Supervisor'}`)
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-[#F0F4FF] px-4 py-6 md:px-6">
            <div className="mx-auto w-full max-w-[1080px]">
                {error && (
                    <div className="mb-4">
                        <Alert type="error" message={error} onClose={() => setError('')} />
                    </div>
                )}

                {success && (
                    <div className="mb-4">
                        <Alert type="success" message={success} onClose={() => setSuccess('')} />
                    </div>
                )}

                <header className="mb-4 rounded-2xl border border-[#D7E1FF] bg-white px-4 py-3 shadow-soft md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#2A4DD0] text-white flex items-center justify-center font-bold">TF</div>
                            <div>
                                <h1 className="text-xl font-bold text-[#1A2756]">ThesisFlow</h1>
                                <p className="text-sm text-[#4D5C8A]">Supervisor Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="!border-[#2A4DD0] !text-[#2A4DD0]"
                                onClick={() => navigate('/notifications')}
                            >
                                <Bell className="mr-2 h-4 w-4" /> Notifications
                            </Button>
                            <Button className="!bg-[#2A4DD0] hover:!bg-[#1f3aa2]" onClick={() => setIsEditOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="space-y-4 self-start lg:sticky lg:top-20">
                        <SupervisorDashboardCard title="Profile Header">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#2A4DD0] text-2xl font-bold text-white">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        initialsFromName(profile.full_name || 'Supervisor')
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-[#1A2756]">{profile.full_name || 'Supervisor Name'}</h3>
                                <p className="text-sm text-[#5A6791]">{supervisor.designation || 'Assistant Professor'}</p>

                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    <SupervisorTag>{supervisor.department || 'CSE'}</SupervisorTag>
                                    <SupervisorTag>{researchTags[0] || 'Research Area'}</SupervisorTag>
                                </div>

                                <div className="mt-4 w-full space-y-2 rounded-xl bg-[#F6F8FF] p-3 text-left text-sm text-[#3A4A7A]">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-[#2A4DD0]" />
                                        <span className="truncate">{profile.email || user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-[#2A4DD0]" />
                                        <span>{profile.phone || '+8801XXXXXXXXX'}</span>
                                    </div>
                                </div>
                            </div>
                        </SupervisorDashboardCard>

                        <SupervisorDashboardCard title="Professional Summary">
                            <div className="space-y-3 text-sm text-[#445486]">
                                <div className="rounded-xl bg-[#F7F9FF] p-3">
                                    <p className="text-xs uppercase tracking-wide text-[#6B79A7]">Years of Experience</p>
                                    <p className="mt-1 text-2xl font-bold text-[#1A2756]">{Number(supervisor.years_of_experience || 0)}</p>
                                </div>
                                <div className="rounded-xl bg-[#F7F9FF] p-3">
                                    <p className="text-xs uppercase tracking-wide text-[#6B79A7]">Total Projects Supervised</p>
                                    <p className="mt-1 text-2xl font-bold text-[#1A2756]">{dashboard.projects.length}</p>
                                </div>
                                <div className="rounded-xl bg-[#F7F9FF] p-3">
                                    <p className="text-xs uppercase tracking-wide text-[#6B79A7]">Current Active Groups</p>
                                    <p className="mt-1 text-2xl font-bold text-[#1A2756]">{dashboard.acceptedGroups.length}</p>
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center justify-between text-xs text-[#6B79A7]">
                                        <span>Capacity Usage</span>
                                        <span>{Math.round(capacityUsage)}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#E4EAFF]">
                                        <div className="h-2 rounded-full bg-[#2A4DD0]" style={{ width: `${capacityUsage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </SupervisorDashboardCard>

                        <SupervisorDashboardCard title="Supervision Capacity">
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-[#F7F9FF] p-3 text-center">
                                        <p className="text-xs text-[#6B79A7]">Max Capacity</p>
                                        <p className="mt-1 text-xl font-bold text-[#1A2756]">{maxCapacity}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F7F9FF] p-3 text-center">
                                        <p className="text-xs text-[#6B79A7]">Assigned</p>
                                        <p className="mt-1 text-xl font-bold text-[#1A2756]">{assignedCount}</p>
                                    </div>
                                    <div className={`rounded-xl p-3 text-center ${availableSlots > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                        <p className="text-xs text-[#6B79A7]">Available</p>
                                        <p className={`mt-1 text-xl font-bold ${availableSlots > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {availableSlots}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-2 w-full rounded-full bg-[#E4EAFF]">
                                    <div className={`h-2 rounded-full ${availableSlots > 0 ? 'bg-[#2A4DD0]' : 'bg-red-500'}`} style={{ width: `${capacityUsage}%` }} />
                                </div>

                                <div className="flex items-end gap-2">
                                    <Input
                                        label="Maximum Group Capacity"
                                        type="number"
                                        min="1"
                                        value={capacityInput}
                                        onChange={(event) => setCapacityInput(event.target.value)}
                                    />
                                    <Button type="button" className="mb-4" onClick={handleCapacityUpdate}>
                                        Update Capacity
                                    </Button>
                                </div>

                                {availableSlots <= 0 && (
                                    <p className="text-xs font-semibold text-red-600">Supervisor is not accepting new students</p>
                                )}
                            </div>
                        </SupervisorDashboardCard>

                        <SupervisorDashboardCard title="Settings">
                            <div className="space-y-2">
                                {['Change Password', 'Update Contact Info', 'Edit Profile Details'].map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setIsEditOpen(true)}
                                        className="flex w-full items-center justify-between rounded-xl border border-[#DCE4FF] px-3 py-2 text-sm font-medium text-[#2A4DD0] hover:bg-[#F4F7FF]"
                                    >
                                        <span>{item}</span>
                                        <Settings className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        </SupervisorDashboardCard>
                    </aside>

                    <main className="space-y-4">
                        <SupervisorDashboardCard title="Short Bio">
                            <div className="rounded-xl border-l-4 border-[#2A4DD0] bg-[#F7F9FF] p-4 text-sm leading-relaxed text-[#334169]">
                                {profile.bio || 'Dedicated to mentoring high-impact thesis work in practical and research-driven domains.'}
                            </div>
                        </SupervisorDashboardCard>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SupervisorDashboardCard title="Research Areas">
                                <div className="flex flex-wrap gap-2">
                                    {researchTags.map((item) => (
                                        <SupervisorTag key={item}>{item}</SupervisorTag>
                                    ))}
                                </div>
                            </SupervisorDashboardCard>

                            <SupervisorDashboardCard title="Preferred Project Domains">
                                <div className="flex flex-wrap gap-2">
                                    {preferredDomains.map((item) => (
                                        <SupervisorTag key={item}>{item}</SupervisorTag>
                                    ))}
                                </div>
                            </SupervisorDashboardCard>
                        </div>

                        <SupervisorDashboardCard title="Project Ideas" action={<PlusCircle className="h-5 w-5 text-[#2A4DD0]" />}>
                            <form className="grid grid-cols-1 gap-3 rounded-xl border border-[#E0E7FF] bg-[#F9FBFF] p-4 md:grid-cols-2" onSubmit={submitProject}>
                                <div className="md:col-span-2">
                                    <Input label="Title" name="title" value={projectForm.title} onChange={handleProjectFormChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Description"
                                        name="description"
                                        rows={3}
                                        value={projectForm.description}
                                        onChange={handleProjectFormChange}
                                    />
                                </div>
                                <Select
                                    label="Category"
                                    name="category"
                                    options={categories.map((cat) => ({ label: cat, value: cat }))}
                                    value={projectForm.category}
                                    onChange={handleProjectFormChange}
                                />
                                <Input
                                    label="YouTube Video Link"
                                    name="video_link"
                                    value={projectForm.video_link}
                                    onChange={handleProjectFormChange}
                                />
                                <div className="md:col-span-2 flex justify-end gap-2">
                                    {editingProjectId && (
                                        <Button type="button" variant="secondary" onClick={resetProjectForm}>
                                            Cancel Edit
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={isProjectSubmitting}>
                                        {isProjectSubmitting ? 'Saving...' : editingProjectId ? 'Update Project' : 'Add Project'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 space-y-3">
                                {dashboard.projects.length === 0 && (
                                    <p className="text-sm text-[#6070A2]">No project ideas yet.</p>
                                )}
                                {dashboard.projects.map((project) => (
                                    <div key={project.id} className="rounded-xl border border-[#DCE4FF] bg-[#F8FAFF] p-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-[#1A2756]">{project.title}</h3>
                                                <p className="mt-1 text-xs text-[#5F6D9B]">{project.category}</p>
                                                <p className="mt-1 text-sm text-[#3A4A7A]">{project.description}</p>
                                                {project.video_link && (
                                                    <a
                                                        href={project.video_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 inline-block text-xs font-semibold text-[#2A4DD0] hover:underline"
                                                    >
                                                        Watch Video
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" size="sm" variant="outline" onClick={() => startEditProject(project)}>
                                                    <Edit className="mr-1 h-3 w-3" /> Edit
                                                </Button>
                                                <Button type="button" size="sm" variant="danger" onClick={() => deleteProject(project.id)}>
                                                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SupervisorDashboardCard>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SupervisorDashboardCard title="Pending Requests">
                                <div className="space-y-3">
                                    {dashboard.pendingRequests.length === 0 && (
                                        <p className="text-sm text-[#6070A2]">No pending requests.</p>
                                    )}
                                    {dashboard.pendingRequests.map((request) => (
                                        <div key={request.id} className="rounded-xl border border-[#DCE4FF] bg-[#F8FAFF] p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-sm font-semibold text-[#1A2756]">
                                                    {request.student?.user_profiles?.full_name || 'Student'}
                                                </p>
                                                <RequestStatusBadge status={request.status} />
                                            </div>
                                            <p className="text-xs text-[#5F6D9B]">
                                                Group: {request.student?.group_name || 'Not provided'}
                                            </p>
                                            <p className="mt-1 text-xs text-[#5F6D9B]">
                                                Project Interest: {request.project_interest || 'General supervision'}
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedRequest(request)}
                                                >
                                                    View Profile
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleRequestAction(request, 'accepted')}
                                                >
                                                    <Check className="mr-1 h-3 w-3" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleRequestAction(request, 'rejected')}
                                                >
                                                    <X className="mr-1 h-3 w-3" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SupervisorDashboardCard>

                            <SupervisorDashboardCard title="Accepted Students / Groups">
                                <div className="space-y-3">
                                    {dashboard.acceptedGroups.length === 0 && (
                                        <p className="text-sm text-[#6070A2]">No accepted groups yet.</p>
                                    )}
                                    {dashboard.acceptedGroups.map((request) => {
                                        const student = request.student || {}
                                        const members = Array.isArray(student.group_members) && student.group_members.length
                                            ? student.group_members
                                            : [{ name: student.user_profiles?.full_name || 'Student', id: student.user_profiles?.student_id || 'N/A', leader: true }]

                                        return (
                                            <div key={request.id} className="rounded-xl border border-[#DCE4FF] bg-[#F8FAFF] p-3">
                                                <p className="text-sm font-semibold text-[#1A2756]">{student.group_name || 'Assigned Group'}</p>
                                                <p className="mt-1 text-xs text-[#5F6D9B]">Project Topic: {request.project_interest || 'General supervision'}</p>
                                                <div className="mt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedRequest(request)}
                                                    >
                                                        View Student Details
                                                    </Button>
                                                </div>
                                                <div className="mt-2 space-y-2">
                                                    {members.map((member, index) => (
                                                        <div key={`${member.id || member.name}-${index}`} className="flex items-center justify-between rounded-lg border border-[#E0E7FF] bg-white px-2 py-1.5">
                                                            <div>
                                                                <p className="text-xs font-semibold text-[#1A2756]">{member.name}</p>
                                                                <p className="text-[11px] text-[#6473A3]">{member.id || 'N/A'}</p>
                                                            </div>
                                                            {member.leader && <span className="rounded-full bg-[#2A4DD0] px-2 py-0.5 text-[10px] font-semibold text-white">Leader</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </SupervisorDashboardCard>
                        </div>

                        <SupervisorDashboardCard title="Communication">
                            <div className="space-y-2">
                                {[...dashboard.pendingRequests, ...dashboard.acceptedGroups].map((request) => {
                                    const studentName = request.student?.user_profiles?.full_name || 'Student'
                                    const studentEmail = request.student?.user_profiles?.email || ''

                                    return (
                                        <div key={`contact-${request.id}`} className="flex flex-col gap-2 rounded-xl border border-[#DCE4FF] bg-[#F8FAFF] p-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-[#1A2756]">{studentName}</p>
                                                <p className="text-xs text-[#6070A2]">{studentEmail || 'No email found'}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={!studentEmail}
                                                onClick={() => openEmail(studentEmail, studentName)}
                                            >
                                                <Mail className="mr-1 h-3 w-3" /> Send Email
                                            </Button>
                                        </div>
                                    )
                                })}
                                {dashboard.pendingRequests.length + dashboard.acceptedGroups.length === 0 && (
                                    <p className="text-sm text-[#6070A2]">No student contacts available yet.</p>
                                )}
                            </div>
                        </SupervisorDashboardCard>

                        <SupervisorDashboardCard title="Activity Timeline">
                            <div className="space-y-3">
                                {dashboard.timeline.length === 0 && (
                                    <p className="text-sm text-[#6070A2]">No activity yet.</p>
                                )}
                                {dashboard.timeline.map((event, index) => (
                                    <div key={`${event.label}-${index}`} className="relative pl-6">
                                        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#2A4DD0]" />
                                        {index !== dashboard.timeline.length - 1 && (
                                            <span className="absolute left-[5px] top-5 h-[calc(100%+8px)] w-[2px] bg-[#D8E2FF]" />
                                        )}
                                        <p className="text-sm font-medium text-[#1A2756]">{event.label}</p>
                                        <p className="text-xs text-[#6B79A7]">{formatDateTime(event.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        </SupervisorDashboardCard>

                        <SupervisorDashboardCard title="Notifications" action={<Bell className="h-4 w-4 text-[#2A4DD0]" />}>
                            <div className="space-y-2">
                                {dashboard.notifications.length === 0 && (
                                    <p className="text-sm text-[#6070A2]">No notifications yet.</p>
                                )}
                                {dashboard.notifications.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-[#DCE4FF] bg-[#F8FAFF] p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-medium text-[#1A2756]">{item.message}</p>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_STYLES[item.type] || STATUS_STYLES.info}`}>
                                                {(item.type || 'info').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[#6B79A7]">{formatDateTime(item.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        </SupervisorDashboardCard>
                    </main>
                </div>
            </div>

            <SupervisorProfileEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                profile={profile}
                supervisor={supervisor}
                onSave={handleSaveProfile}
                isSaving={isSaving}
            />

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
                                {selectedRequest.student?.user_profiles?.full_name || 'Student'}
                            </p>
                            <p className="text-sm text-[#6070A2]">{selectedRequest.student?.user_profiles?.email || 'Email unavailable'}</p>
                            <p className="text-sm text-[#6070A2]">Phone: {selectedRequest.student?.user_profiles?.phone || '+8801XXXXXXXXX'}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Student ID</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{selectedRequest.student?.user_profiles?.student_id || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Department</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{selectedRequest.student?.department || selectedRequest.student?.user_profiles?.department || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Group Name</p>
                                <p className="mt-1 font-semibold text-[#1A2756]">{selectedRequest.student?.group_name || 'Not set'}</p>
                            </div>
                            <div className="rounded-lg border border-[#DCE4FF] p-3">
                                <p className="text-xs text-[#6B79A7]">Request Status</p>
                                <p className="mt-1 font-semibold capitalize text-[#1A2756]">{selectedRequest.status}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#DCE4FF] p-3">
                            <p className="text-xs text-[#6B79A7]">Request Details</p>
                            <p className="mt-1 text-sm text-[#334169]">Project Interest: {selectedRequest.project_interest || 'General supervision request'}</p>
                            <p className="mt-1 text-sm text-[#334169]">Submitted: {formatDateTime(selectedRequest.created_at)}</p>
                        </div>

                        <div className="rounded-lg border border-[#DCE4FF] p-3">
                            <p className="text-xs text-[#6B79A7]">Group Members</p>
                            <div className="mt-2 space-y-2">
                                {(selectedRequest.student?.group_members || [{
                                    name: selectedRequest.student?.user_profiles?.full_name || 'Student',
                                    id: selectedRequest.student?.user_profiles?.student_id || 'N/A',
                                    leader: true,
                                }]).map((member, idx) => (
                                    <div key={`${member.id || member.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-[#E0E7FF] bg-white px-3 py-2">
                                        <div>
                                            <p className="text-sm font-semibold text-[#1A2756]">{member.name}</p>
                                            <p className="text-xs text-[#6171A2]">{member.id || 'N/A'}</p>
                                        </div>
                                        {member.leader && (
                                            <span className="rounded-full bg-[#2A4DD0] px-2 py-1 text-xs font-semibold text-white">Leader</span>
                                        )}
                                    </div>
                                ))}
                            </div>
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
