import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

const asDate = (value) => {
    if (!value) return null
    if (typeof value.toDate === 'function') return value.toDate()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const sortByRecent = (items = []) => {
    return [...items].sort((a, b) => {
        const aTime = asDate(a.created_at)?.getTime() || 0
        const bTime = asDate(b.created_at)?.getTime() || 0
        return bTime - aTime
    })
}

const splitTags = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)

    return String(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
}

const getProfile = async (uid) => {
    if (!db || !uid) return null
    const snap = await getDoc(doc(db, 'user_profiles', uid))
    return snap.exists() ? mapDoc(snap) : null
}

const getSupervisorDoc = async (uid) => {
    if (!db || !uid) return null

    const direct = await getDoc(doc(db, 'supervisors', uid))
    if (direct.exists()) return mapDoc(direct)

    const q = query(collection(db, 'supervisors'), where('user_id', '==', uid))
    const snapshot = await getDocs(q)
    return snapshot.docs[0] ? mapDoc(snapshot.docs[0]) : null
}

const getStudentBundle = async (studentId) => {
    if (!db || !studentId) return null
    const snap = await getDoc(doc(db, 'students', studentId))
    if (!snap.exists()) return null

    const student = mapDoc(snap)
    const profile = await getProfile(student.user_id || student.id)
    return { ...student, user_profiles: profile }
}

const formatNotifications = (items = []) =>
    sortByRecent(items).map((item) => ({ ...item, created_at: asDate(item.created_at) }))

export const supervisorDashboardService = {
    async getSupervisorDashboard(uid) {
        try {
            if (!db) throw new Error('Firebase is not configured.')

            const [profile, supervisor, notificationsSnap] = await Promise.all([
                getProfile(uid),
                getSupervisorDoc(uid),
                getDocs(query(collection(db, 'notifications'), where('user_id', '==', uid))),
            ])

            if (!supervisor) {
                throw new Error('Supervisor profile not found. Please complete supervisor registration.')
            }

            const supervisorKeys = [supervisor.id, supervisor.user_id].filter(Boolean)

            const [requestsSnapshots, projectsSnapshots] = await Promise.all([
                Promise.all(
                    supervisorKeys.map((key) =>
                        getDocs(query(collection(db, 'supervisor_requests'), where('supervisor_id', '==', key))),
                    ),
                ),
                Promise.all([
                    getDocs(query(collection(db, 'projects'), where('created_by', '==', uid))),
                    getDocs(query(collection(db, 'projects'), where('supervisor_id', '==', supervisor.id))),
                ]),
            ])

            const requestsMap = new Map()
            requestsSnapshots.forEach((snapshot) => {
                snapshot.docs.forEach((docSnap) => {
                    requestsMap.set(docSnap.id, mapDoc(docSnap))
                })
            })

            const projectMap = new Map()
            projectsSnapshots.forEach((snapshot) => {
                snapshot.docs.forEach((docSnap) => {
                    projectMap.set(docSnap.id, mapDoc(docSnap))
                })
            })

            const requests = sortByRecent(Array.from(requestsMap.values()))
            const projects = sortByRecent(Array.from(projectMap.values()))

            const requestsWithStudents = await Promise.all(
                requests.map(async (request) => ({
                    ...request,
                    student: await getStudentBundle(request.student_id),
                })),
            )

            const acceptedGroups = requestsWithStudents.filter((item) => item.status === 'accepted')
            const pendingRequests = requestsWithStudents.filter((item) => item.status === 'pending')
            const maxCapacity = Number(supervisor.max_capacity ?? 5)
            const assignedCount = acceptedGroups.length
            const availableSlots = Math.max(0, maxCapacity - assignedCount)

            const timeline = [
                ...projects.map((project) => ({
                    label: `Project added: ${project.title}`,
                    created_at: project.created_at,
                })),
                ...requestsWithStudents.map((request) => ({
                    label: `Request ${request.status}: ${request.student?.user_profiles?.full_name || 'Student'}`,
                    created_at: request.created_at,
                })),
            ]

            return {
                success: true,
                data: {
                    profile: {
                        id: uid,
                        full_name: profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Supervisor Name',
                        email: profile?.email || '',
                        phone: profile?.phone || '+8801XXXXXXXXX',
                        bio: profile?.bio || 'Focused on mentoring impactful thesis projects and applied research.',
                        avatar_url: profile?.avatar_url || '',
                    },
                    supervisor: {
                        ...supervisor,
                        department: supervisor.department || profile?.department || 'CSE',
                        designation: supervisor.designation || 'Assistant Professor',
                        research_area: supervisor.research_area || 'AI/ML',
                        years_of_experience: Number(supervisor.years_of_experience || 0),
                        max_capacity: maxCapacity,
                        assigned_count: assignedCount,
                        available_slots: availableSlots,
                        preferred_project_domains: splitTags(supervisor.preferred_project_domains || supervisor.research_area),
                    },
                    projects,
                    pendingRequests,
                    acceptedGroups,
                    notifications: formatNotifications(notificationsSnap.docs.map(mapDoc)).slice(0, 10),
                    timeline: sortByRecent(timeline).slice(0, 10),
                },
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    subscribeToNotifications(uid, callback) {
        if (!db || !uid) return () => {}
        const q = query(collection(db, 'notifications'), where('user_id', '==', uid))

        return onSnapshot(q, (snapshot) => {
            callback(formatNotifications(snapshot.docs.map(mapDoc)).slice(0, 10))
        })
    },

    async updateProfile(uid, supervisorId, payload) {
        try {
            if (!db) throw new Error('Firebase is not configured.')

            const profilePayload = {
                full_name: payload.full_name,
                phone: payload.phone,
                department: payload.department,
                bio: payload.bio,
                avatar_url: payload.avatar_url || '',
                updated_at: serverTimestamp(),
            }

            const supervisorPayload = {
                user_id: uid,
                department: payload.department,
                designation: payload.designation,
                years_of_experience: Number(payload.years_of_experience) || 0,
                research_area: payload.research_area,
                preferred_project_domains: payload.preferred_project_domains || [],
                updated_at: serverTimestamp(),
            }

            await Promise.all([
                setDoc(doc(db, 'user_profiles', uid), profilePayload, { merge: true }),
                setDoc(doc(db, 'supervisors', supervisorId || uid), supervisorPayload, { merge: true }),
            ])

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateCapacity(supervisorId, maxCapacity) {
        try {
            if (!db) throw new Error('Firebase is not configured.')

            const capacity = Math.max(1, Number(maxCapacity) || 1)
            await setDoc(
                doc(db, 'supervisors', supervisorId),
                {
                    max_capacity: capacity,
                    updated_at: serverTimestamp(),
                },
                { merge: true }
            )

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
