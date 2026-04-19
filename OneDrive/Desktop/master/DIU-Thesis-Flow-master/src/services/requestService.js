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

const resolveSupervisorDoc = async (supervisorRef) => {
    if (!db || !supervisorRef) return null

    const directSnap = await getDoc(doc(db, 'supervisors', supervisorRef))
    if (directSnap.exists()) return mapDoc(directSnap)

    const q = query(collection(db, 'supervisors'), where('user_id', '==', supervisorRef))
    const snapshot = await getDocs(q)
    return snapshot.docs[0] ? mapDoc(snapshot.docs[0]) : null
}

const getAcceptedCount = async (supervisorDoc) => {
    if (!db || !supervisorDoc) return 0

    const keys = [...new Set([supervisorDoc.id, supervisorDoc.user_id].filter(Boolean))]
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

const syncAssignedCount = async (supervisorDoc) => {
    if (!db || !supervisorDoc?.id) return 0
    const assignedCount = await getAcceptedCount(supervisorDoc)
    await updateDoc(doc(db, 'supervisors', supervisorDoc.id), { assigned_count: assignedCount })
    return assignedCount
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

            const supervisorDoc = await resolveSupervisorDoc(supervisorId)
            if (!supervisorDoc) {
                throw new Error('Supervisor profile not found.')
            }

            const maxCapacity = Number(supervisorDoc.max_capacity ?? 5)
            const assignedCount = await syncAssignedCount(supervisorDoc)
            if (maxCapacity > 0 && assignedCount >= maxCapacity) {
                throw new Error('Supervisor is not accepting new students.')
            }

            const payload = {
                student_id: studentId,
                supervisor_id: supervisorId,
                status: 'pending',
                created_at: serverTimestamp(),
            }

            const docRef = await addDoc(collection(db, 'supervisor_requests'), payload)

            await addDoc(collection(db, 'notifications'), {
                user_id: supervisorDoc.user_id || supervisorDoc.id,
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

            const supervisorDoc = await resolveSupervisorDoc(supervisorId)
            const keys = [...new Set([supervisorId, supervisorDoc?.id, supervisorDoc?.user_id].filter(Boolean))]

            const snapshots = await Promise.all(
                keys.map((key) =>
                    getDocs(query(collection(db, 'supervisor_requests'), where('supervisor_id', '==', key)))
                )
            )

            const requestMap = new Map()
            snapshots.forEach((snapshot) => {
                snapshot.docs.forEach((docSnap) => {
                    requestMap.set(docSnap.id, mapDoc(docSnap))
                })
            })

            const requests = await Promise.all(
                Array.from(requestMap.values()).map(async (request) => {
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

            const requestSnap = await getDoc(doc(db, 'supervisor_requests', id))
            if (!requestSnap.exists()) throw new Error('Request not found.')

            const request = mapDoc(requestSnap)
            const previousStatus = request.status
            const supervisorDoc = await resolveSupervisorDoc(request.supervisor_id)

            if (status === 'accepted' && previousStatus !== 'accepted' && supervisorDoc) {
                const maxCapacity = Number(supervisorDoc.max_capacity ?? 5)
                const assignedCount = await syncAssignedCount(supervisorDoc)
                if (maxCapacity > 0 && assignedCount >= maxCapacity) {
                    throw new Error('No available supervision slots. Increase capacity or reject this request.')
                }
            }

            await updateDoc(doc(db, 'supervisor_requests', id), { status })
            const snap = await getDoc(doc(db, 'supervisor_requests', id))

            if (supervisorDoc && (previousStatus === 'accepted' || status === 'accepted')) {
                await syncAssignedCount(supervisorDoc)
            }

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
