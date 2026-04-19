import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

const safeTimestamp = (value) => {
    if (!value) return null
    if (typeof value.toDate === 'function') return value.toDate()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const sortByCreatedAtDesc = (items = []) => {
    return [...items].sort((a, b) => {
        const aTime = safeTimestamp(a.created_at)?.getTime() || 0
        const bTime = safeTimestamp(b.created_at)?.getTime() || 0
        return bTime - aTime
    })
}

const fallbackProfile = (uid) => ({
    id: uid,
    full_name: 'Student Name',
    student_id: 'N/A',
    department: 'CSE',
    semester: 8,
    email: '',
    phone: '+8801XXXXXXXXX',
    avatar_url: '',
    bio: 'Passionate student working on research-oriented and production-ready thesis projects.',
})

const fallbackStudent = {
    cgpa: 3.65,
    standing: 'Distinction',
    skills: ['Python', 'JavaScript', 'React', 'TensorFlow', 'Git', 'Figma'],
    preferred_domains: ['AI/ML', 'Web Dev', 'Mobile', 'IoT'],
    preferred_types: ['Research', 'Development'],
    github_url: 'https://github.com/',
    portfolio_url: 'https://',
    past_project: 'Smart Campus Monitoring System',
    group_name: 'Thesis Titans',
    group_members: [],
    timeline_events: [
        { label: 'Account created', created_at: new Date() },
        { label: 'Group formed', created_at: new Date() },
    ],
}

const enrichSupervisor = async (request) => {
    if (!db || !request?.supervisor_id) return null

    const supervisorSnap = await getDoc(doc(db, 'supervisors', request.supervisor_id))
    if (!supervisorSnap.exists()) return null

    const supervisor = mapDoc(supervisorSnap)
    const profileId = supervisor.user_id || supervisor.id
    const profileSnap = await getDoc(doc(db, 'user_profiles', profileId))

    return {
        ...supervisor,
        user_profiles: profileSnap.exists() ? mapDoc(profileSnap) : null,
    }
}

const readFirstExistingProfile = async (uid) => {
    if (!db) return null

    const usersRef = doc(db, 'users', uid)
    const profileRef = doc(db, 'user_profiles', uid)

    const [usersSnap, profileSnap] = await Promise.all([getDoc(usersRef), getDoc(profileRef)])

    if (usersSnap.exists()) return mapDoc(usersSnap)
    if (profileSnap.exists()) return mapDoc(profileSnap)
    return null
}

const formatNotifications = (items = []) => {
    return sortByCreatedAtDesc(items).map((item) => ({
        ...item,
        created_at: safeTimestamp(item.created_at),
    }))
}

export const studentDashboardService = {
    async getStudentDashboard(uid) {
        try {
            if (!db) throw new Error('Firebase is not configured.')

            const [profile, studentSnap, requestsSnap, notificationsSnap] = await Promise.all([
                readFirstExistingProfile(uid),
                getDoc(doc(db, 'students', uid)),
                getDocs(query(collection(db, 'supervisor_requests'), where('student_id', '==', uid))),
                getDocs(query(collection(db, 'notifications'), where('user_id', '==', uid))),
            ])

            const student = studentSnap.exists() ? mapDoc(studentSnap) : null
            const requests = requestsSnap.docs.map(mapDoc)
            const notifications = formatNotifications(notificationsSnap.docs.map(mapDoc)).slice(0, 8)

            const latestRequest = sortByCreatedAtDesc(requests)[0] || null
            const supervisor = latestRequest ? await enrichSupervisor(latestRequest) : null

            return {
                success: true,
                data: {
                    profile: { ...fallbackProfile(uid), ...(profile || {}) },
                    student: { ...fallbackStudent, ...(student || {}) },
                    latestRequest,
                    supervisor,
                    notifications,
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
            const notifications = formatNotifications(snapshot.docs.map(mapDoc)).slice(0, 8)
            callback(notifications)
        })
    },

    subscribeToRequests(uid, callback) {
        if (!db || !uid) return () => {}

        const q = query(collection(db, 'supervisor_requests'), where('student_id', '==', uid))
        return onSnapshot(q, async (snapshot) => {
            const requests = sortByCreatedAtDesc(snapshot.docs.map(mapDoc))
            const latestRequest = requests[0] || null
            const supervisor = latestRequest ? await enrichSupervisor(latestRequest) : null
            callback({ latestRequest, supervisor })
        })
    },

    async updateProfile(uid, payload) {
        try {
            if (!db) throw new Error('Firebase is not configured.')

            const profilePayload = {
                full_name: payload.full_name,
                phone: payload.phone,
                department: payload.department,
                semester: Number(payload.semester) || null,
                bio: payload.bio,
                student_id: payload.student_id,
                avatar_url: payload.avatar_url || '',
            }

            const studentPayload = {
                cgpa: Number(payload.cgpa) || null,
                standing: payload.standing,
                preferred_domains: payload.preferred_domains || [],
                preferred_types: payload.preferred_types || [],
                github_url: payload.github_url || '',
                portfolio_url: payload.portfolio_url || '',
                past_project: payload.past_project || '',
                group_name: payload.group_name || '',
                group_members: payload.group_members || [],
            }

            await Promise.all([
                setDoc(doc(db, 'users', uid), profilePayload, { merge: true }),
                setDoc(doc(db, 'user_profiles', uid), profilePayload, { merge: true }),
                setDoc(doc(db, 'students', uid), studentPayload, { merge: true }),
            ])

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
