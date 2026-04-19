import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

const getAcceptedCount = async (supervisor) => {
    if (!db || !supervisor) return 0

    const keys = [...new Set([supervisor.id, supervisor.user_id].filter(Boolean))]
    const counts = await Promise.all(
        keys.map(async (key) => {
            const q = query(
                collection(db, 'supervisor_requests'),
                where('supervisor_id', '==', key),
                where('status', '==', 'accepted')
            )
            const snapshot = await getDocs(q)
            return snapshot.size
        })
    )

    return Math.max(0, ...counts, 0)
}

const withCapacity = async (supervisor) => {
    const assignedCount = await getAcceptedCount(supervisor)
    const maxCapacity = Number(supervisor.max_capacity ?? 5)
    return {
        ...supervisor,
        max_capacity: maxCapacity,
        assigned_count: assignedCount,
        available_slots: Math.max(0, maxCapacity - assignedCount),
    }
}

const attachProfile = async (supervisor) => {
    if (!db) return supervisor
    const profileSnap = await getDoc(doc(db, 'user_profiles', supervisor.user_id || supervisor.id))
    const profile = profileSnap.exists() ? mapDoc(profileSnap) : null
    const supervisorWithCapacity = await withCapacity(supervisor)
    return { ...supervisorWithCapacity, user_profiles: profile }
}

export const supervisorService = {
    async getSupervisors() {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(collection(db, 'supervisors'), orderBy('department', 'asc'))
            const snapshot = await getDocs(q)
            const supervisors = await Promise.all(
                snapshot.docs.map(async (snap) => attachProfile(mapDoc(snap)))
            )
            return { success: true, data: supervisors }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getSupervisorById(id) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const snap = await getDoc(doc(db, 'supervisors', id))
            if (!snap.exists()) throw new Error('Supervisor not found')
            const supervisor = await attachProfile(mapDoc(snap))
            return { success: true, data: supervisor }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getSupervisorsByDepartment(department) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'supervisors'),
                where('department', '==', department)
            )
            const snapshot = await getDocs(q)
            const supervisors = await Promise.all(
                snapshot.docs.map(async (snap) => attachProfile(mapDoc(snap)))
            )
            return { success: true, data: supervisors }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getSupervisorByUserId(userId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(collection(db, 'supervisors'), where('user_id', '==', userId))
            const snapshot = await getDocs(q)
            const first = snapshot.docs[0]
            if (!first) return { success: true, data: null }
            const supervisor = await attachProfile(mapDoc(first))
            return { success: true, data: supervisor }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createSupervisor(supervisorData) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const docRef = await addDoc(collection(db, 'supervisors'), supervisorData)
            return { success: true, data: [{ id: docRef.id, ...supervisorData }] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateSupervisor(id, updates) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await updateDoc(doc(db, 'supervisors', id), updates)
            const snap = await getDoc(doc(db, 'supervisors', id))
            return { success: true, data: [mapDoc(snap)] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
