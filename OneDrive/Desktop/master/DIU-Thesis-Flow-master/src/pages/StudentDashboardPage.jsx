import React, { useEffect, useMemo, useState } from 'react'
import {
    Bell,
    BookOpen,
    Edit,
    GraduationCap,
    Mail,
    Phone,
    Settings,
    User,
    Users,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
    StatusPill,
    StudentDashboardCard,
    StudentTag,
} from '../components/studentDashboard/StudentDashboardCard'
import { StudentProfileEditModal } from '../components/studentDashboard/StudentProfileEditModal'
import { useAuthStore } from '../context/store'
import { studentDashboardService } from '../services/studentDashboardService'

const progressFromCgpa = (cgpa) => {
    const value = Number(cgpa)
    if (Number.isNaN(value)) return 0
    return Math.max(0, Math.min(100, (value / 4) * 100))
}

const initialsFromName = (name = '') => {
    const parts = String(name).trim().split(' ').filter(Boolean)
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '') || 'S'
}

const formatDateTime = (value) => {
    if (!value) return 'Just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Just now'
    return date.toLocaleString()
}

const STATUS_STYLES = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    request: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export const StudentDashboardPage = () => {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [dashboard, setDashboard] = useState({
        profile: null,
        student: null,
        latestRequest: null,
        supervisor: null,
        notifications: [],
    })

    useEffect(() => {
        if (!user?.uid) return

        let stopNotifications = () => {}
        let stopRequests = () => {}

        const loadDashboard = async () => {
            setLoading(true)
            const result = await studentDashboardService.getStudentDashboard(user.uid)
            if (!result.success) {
                setError(result.error || 'Failed to load dashboard data.')
                setLoading(false)
                return
            }

            setDashboard(result.data)
            setError('')
            setLoading(false)

            stopNotifications = studentDashboardService.subscribeToNotifications(user.uid, (notifications) => {
                setDashboard((prev) => ({ ...prev, notifications }))
            })

            stopRequests = studentDashboardService.subscribeToRequests(user.uid, ({ latestRequest, supervisor }) => {
                setDashboard((prev) => ({ ...prev, latestRequest, supervisor }))
            })
        }

        loadDashboard()

        return () => {
            stopNotifications()
            stopRequests()
        }
    }, [user?.uid])

    const profile = dashboard.profile || {}
    const student = dashboard.student || {}
    const notifications = dashboard.notifications || []

    const fullName = profile.full_name || profile.name || 'Student Name'
    const email = profile.email || user?.email || 'student@example.com'
    const studentId = profile.student_id || 'N/A'
    const semester = profile.semester || student.semester || 'N/A'
    const department = profile.department || student.department || 'CSE'

    const skills = useMemo(() => {
        const fromStudent = Array.isArray(student.skills) ? student.skills : []
        return fromStudent.length ? fromStudent : ['Python', 'JavaScript', 'React', 'Git', 'Figma', 'TensorFlow']
    }, [student.skills])

    const preferredDomains = Array.isArray(student.preferred_domains) && student.preferred_domains.length
        ? student.preferred_domains
        : ['AI/ML', 'Web Dev', 'Mobile', 'IoT']

    const preferredTypes = Array.isArray(student.preferred_types) && student.preferred_types.length
        ? student.preferred_types
        : ['Research', 'Development']

    const groupMembers = Array.isArray(student.group_members) && student.group_members.length
        ? student.group_members
        : [
            { name: fullName, id: studentId, leader: true },
            { name: 'Member 2', id: 'N/A', leader: false },
        ]

    const timelineEvents = Array.isArray(student.timeline_events) && student.timeline_events.length
        ? student.timeline_events
        : [
            { label: 'Account created', created_at: new Date() },
            { label: 'Group formed', created_at: new Date() },
            { label: 'Request sent', created_at: new Date() },
            { label: 'Supervisor accepted', created_at: new Date() },
        ]

    const openEmailToSupervisor = () => {
        const sup = dashboard.supervisor
        const supName = sup?.user_profiles?.full_name || 'Supervisor'
        const supEmail = sup?.user_profiles?.email || ''

        if (!supEmail) return

        const subject = encodeURIComponent('ThesisFlow: Student Follow-up')
        const body = encodeURIComponent(`Hello ${supName},\n\nI wanted to follow up regarding my thesis supervision request.\n\nRegards,\n${fullName}`)
        window.location.href = `mailto:${supEmail}?subject=${subject}&body=${body}`
    }

    const handleSaveProfile = async (payload) => {
        setIsSaving(true)
        const result = await studentDashboardService.updateProfile(user.uid, payload)
        setIsSaving(false)

        if (!result.success) {
            return { success: false, error: result.error }
        }

        const refreshed = await studentDashboardService.getStudentDashboard(user.uid)
        if (refreshed.success) {
            setDashboard(refreshed.data)
        }

        return { success: true }
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

                <header className="mb-4 rounded-2xl border border-[#D7E1FF] bg-white px-4 py-3 shadow-soft md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#2A4DD0] text-white flex items-center justify-center font-bold">TF</div>
                            <div>
                                <h1 className="text-xl font-bold text-[#1A2756]">ThesisFlow</h1>
                                <p className="text-sm text-[#4D5C8A]">Student Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="!border-[#2A4DD0] !text-[#2A4DD0]">
                                <Bell className="mr-2 h-4 w-4" /> Notifications
                            </Button>
                            <Button className="!bg-[#2A4DD0] hover:!bg-[#1f3aa2]" onClick={() => setIsEditOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-20 self-start">
                        <StudentDashboardCard title="Profile Header">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#2A4DD0] text-2xl font-bold text-white">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={fullName}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        initialsFromName(fullName)
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-[#1A2756]">{fullName}</h3>
                                <p className="text-sm text-[#5A6791]">{studentId}</p>
                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    <StudentTag>{department}</StudentTag>
                                    <StudentTag>Semester {semester}</StudentTag>
                                </div>

                                <div className="mt-4 w-full space-y-2 rounded-xl bg-[#F6F8FF] p-3 text-left text-sm text-[#3A4A7A]">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-[#2A4DD0]" />
                                        <span className="truncate">{email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-[#2A4DD0]" />
                                        <span>{profile.phone || '+8801XXXXXXXXX'}</span>
                                    </div>
                                </div>
                            </div>
                        </StudentDashboardCard>

                        <StudentDashboardCard title="Academic Summary">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#2A4DD0]">{Number(student.cgpa || 0).toFixed(2)}</p>
                                <p className="text-sm text-[#6A76A3]">/ 4.00</p>
                                <p className="mt-2 inline-flex rounded-full bg-[#E3EBFF] px-3 py-1 text-xs font-semibold text-[#2A4DD0]">
                                    {student.standing || 'Distinction'}
                                </p>
                            </div>
                            <div className="mt-4 h-2 w-full rounded-full bg-[#E4EAFF]">
                                <div
                                    className="h-2 rounded-full bg-[#2A4DD0]"
                                    style={{ width: `${progressFromCgpa(student.cgpa)}%` }}
                                />
                            </div>
                        </StudentDashboardCard>

                        <StudentDashboardCard title="Settings">
                            <div className="space-y-2">
                                {['Change Password', 'Update Phone', 'Edit Profile Info'].map((item) => (
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
                        </StudentDashboardCard>
                    </aside>

                    <main className="space-y-4">
                        <StudentDashboardCard title="Short Bio">
                            <div className="rounded-xl border-l-4 border-[#2A4DD0] bg-[#F7F9FF] p-4 text-sm leading-relaxed text-[#334169]">
                                {profile.bio || 'Focused on scalable software systems and practical AI applications for education and research.'}
                            </div>
                        </StudentDashboardCard>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <StudentDashboardCard title="Skills & Tools">
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="mb-2 font-semibold text-[#1A2756]">Programming</p>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.filter((s) => ['Python', 'JavaScript', 'React'].includes(s)).map((skill) => (
                                                <StudentTag key={skill}>{skill}</StudentTag>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 font-semibold text-[#1A2756]">Tools</p>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.filter((s) => ['Git', 'Figma'].includes(s)).map((tool) => (
                                                <StudentTag key={tool}>{tool}</StudentTag>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 font-semibold text-[#1A2756]">AI/ML</p>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.filter((s) => s.toLowerCase().includes('tensor') || s.toLowerCase().includes('ai')).map((item) => (
                                                <StudentTag key={item}>{item}</StudentTag>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </StudentDashboardCard>

                            <StudentDashboardCard title="Project Preferences">
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="mb-2 font-semibold text-[#1A2756]">Domains</p>
                                        <div className="flex flex-wrap gap-2">
                                            {preferredDomains.map((domain) => (
                                                <StudentTag key={domain}>{domain}</StudentTag>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 font-semibold text-[#1A2756]">Preferred Type</p>
                                        <div className="flex flex-wrap gap-2">
                                            {preferredTypes.map((type) => (
                                                <StudentTag key={type}>{type}</StudentTag>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </StudentDashboardCard>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <StudentDashboardCard title="Supervisor" action={<StatusPill status={dashboard.latestRequest?.status || 'pending'} />}>
                                <div className="space-y-2 text-sm text-[#425182]">
                                    <p className="flex items-center gap-2 text-base font-semibold text-[#1A2756]"><User className="h-4 w-4" /> {dashboard.supervisor?.user_profiles?.full_name || 'Not selected yet'}</p>
                                    <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {dashboard.supervisor?.department || 'Department not available'}</p>
                                    <Button
                                        className="mt-2 !bg-[#2A4DD0] hover:!bg-[#1f3aa2]"
                                        disabled={!dashboard.supervisor?.user_profiles?.email}
                                        onClick={openEmailToSupervisor}
                                    >
                                        <Mail className="mr-2 h-4 w-4" /> Send Email to Supervisor
                                    </Button>
                                </div>
                            </StudentDashboardCard>

                            <StudentDashboardCard title="Group">
                                <div className="space-y-3 text-sm text-[#425182]">
                                    <p className="font-semibold text-[#1A2756]">{student.group_name || 'Thesis Titans'}</p>
                                    <div className="space-y-2">
                                        {groupMembers.map((member, index) => (
                                            <div key={`${member.id}-${index}`} className="flex items-center justify-between rounded-lg border border-[#E0E7FF] bg-[#F8FAFF] px-3 py-2">
                                                <div>
                                                    <p className="font-medium text-[#1A2756]">{member.name}</p>
                                                    <p className="text-xs text-[#6171A2]">{member.id}</p>
                                                </div>
                                                {member.leader && <span className="rounded-full bg-[#2A4DD0] px-2 py-1 text-xs font-semibold text-white">Leader</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </StudentDashboardCard>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <StudentDashboardCard title="Portfolio & Work">
                                <div className="space-y-2 text-sm">
                                    <a
                                        href={student.github_url || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] p-3 text-[#2A4DD0] hover:bg-[#EEF3FF]"
                                    >
                                        GitHub Profile
                                    </a>
                                    <a
                                        href={student.portfolio_url || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] p-3 text-[#2A4DD0] hover:bg-[#EEF3FF]"
                                    >
                                        Portfolio Website
                                    </a>
                                    <div className="rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] p-3 text-[#2A4DD0]">
                                        Past project: {student.past_project || 'Smart Campus Monitoring System'}
                                    </div>
                                </div>
                            </StudentDashboardCard>

                            <StudentDashboardCard title="Activity Timeline">
                                <div className="space-y-4">
                                    {timelineEvents.map((event, index) => (
                                        <div key={`${event.label}-${index}`} className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#2A4DD0]" />
                                            {index !== timelineEvents.length - 1 && (
                                                <span className="absolute left-[5px] top-5 h-[calc(100%+8px)] w-[2px] bg-[#D8E2FF]" />
                                            )}
                                            <p className="text-sm font-medium text-[#1A2756]">{event.label}</p>
                                            <p className="text-xs text-[#6B79A7]">{formatDateTime(event.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            </StudentDashboardCard>
                        </div>

                        <StudentDashboardCard title="Notifications" action={<Bell className="h-4 w-4 text-[#2A4DD0]" />}>
                            <div className="space-y-2">
                                {notifications.length === 0 && (
                                    <p className="text-sm text-[#6070A2]">No notifications yet.</p>
                                )}
                                {notifications.map((item) => (
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
                        </StudentDashboardCard>
                    </main>
                </div>
            </div>

            <StudentProfileEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                profile={profile}
                student={student}
                isSaving={isSaving}
                onSave={handleSaveProfile}
            />
        </div>
    )
}
