import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

const getProfile = async (userId) => {
    if (!db || !userId) return null
    const profileSnap = await getDoc(doc(db, 'user_profiles', userId))
    return profileSnap.exists() ? mapDoc(profileSnap) : null
}

const getSupervisorBundle = async (supervisorId) => {
    if (!db || !supervisorId) return null
    const supervisorSnap = await getDoc(doc(db, 'supervisors', supervisorId))
    if (!supervisorSnap.exists()) return null
    const supervisor = mapDoc(supervisorSnap)
    const profile = await getProfile(supervisor.user_id || supervisor.id)
    return { ...supervisor, user_profiles: profile }
}

const getStudentBundle = async (studentId) => {
    if (!db || !studentId) return null
    const studentSnap = await getDoc(doc(db, 'students', studentId))
    if (!studentSnap.exists()) return null
    const student = mapDoc(studentSnap)
    const profile = await getProfile(student.user_id || student.id)
    return { ...student, user_profiles: profile }
}

export const requestService = {
    async sendRequest(studentId, supervisorId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const payload = {
                student_id: studentId,
                supervisor_id: supervisorId,
                status: 'pending',
                created_at: serverTimestamp(),
            }

            const docRef = await addDoc(collection(db, 'supervisor_requests'), payload)

            await addDoc(collection(db, 'notifications'), {
                user_id: supervisorId,
                message: `New supervisor request from student ${studentId}`,
                type: 'request',
                is_read: false,
                created_at: serverTimestamp(),
            })

            return { success: true, data: [{ id: docRef.id, ...payload }] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestsForSupervisor(supervisorId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'supervisor_requests'),
                where('supervisor_id', '==', supervisorId)
            )
            const snapshot = await getDocs(q)
            const requests = await Promise.all(
                snapshot.docs.map(async (snap) => {
                    const request = mapDoc(snap)
                    const student = await getStudentBundle(request.student_id)
                    return { ...request, students: student }
                })
            )
            return { success: true, data: requests }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestsForStudent(studentId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'supervisor_requests'),
                where('student_id', '==', studentId)
            )
            const snapshot = await getDocs(q)
            const requests = await Promise.all(
                snapshot.docs.map(async (snap) => {
                    const request = mapDoc(snap)
                    const supervisor = await getSupervisorBundle(request.supervisor_id)
                    return { ...request, supervisors: supervisor }
                })
            )
            return { success: true, data: requests }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateRequest(id, status) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await updateDoc(doc(db, 'supervisor_requests', id), { status })
            const snap = await getDoc(doc(db, 'supervisor_requests', id))
            return { success: true, data: [mapDoc(snap)] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestStatus(studentId, supervisorId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'supervisor_requests'),
                where('student_id', '==', studentId),
                where('supervisor_id', '==', supervisorId)
            )
            const snapshot = await getDocs(q)
            const docSnap = snapshot.docs[0]
            return { success: true, data: docSnap ? { status: docSnap.data().status } : null }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestStatusesBatch(studentId, supervisorIds) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            if (!supervisorIds?.length) return { success: true, data: {} }

            const statusMap = {}
            const chunkSize = 10
            for (let i = 0; i < supervisorIds.length; i += chunkSize) {
                const chunk = supervisorIds.slice(i, i + chunkSize)
                const q = query(
                    collection(db, 'supervisor_requests'),
                    where('student_id', '==', studentId),
                    where('supervisor_id', 'in', chunk)
                )
                const snapshot = await getDocs(q)
                snapshot.docs.forEach((snap) => {
                    statusMap[snap.data().supervisor_id] = snap.data().status
                })
            }

            return { success: true, data: statusMap }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
