import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

const getUserProfile = async (userId) => {
    if (!db || !userId) return null
    const profileSnap = await getDoc(doc(db, 'user_profiles', userId))
    return profileSnap.exists() ? mapDoc(profileSnap) : null
}

const getSupervisor = async (supervisorId) => {
    if (!db || !supervisorId) return null
    const supervisorSnap = await getDoc(doc(db, 'supervisors', supervisorId))
    if (!supervisorSnap.exists()) return null
    const supervisor = mapDoc(supervisorSnap)
    const profile = await getUserProfile(supervisor.user_id || supervisor.id)
    return { ...supervisor, user_profiles: profile }
}

export const projectService = {
    async getProjects() {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(collection(db, 'projects'), orderBy('created_at', 'desc'))
            const snapshot = await getDocs(q)
            const projects = await Promise.all(
                snapshot.docs.map(async (snap) => {
                    const project = mapDoc(snap)
                    const createdBy = await getUserProfile(project.created_by)
                    const supervisor = await getSupervisor(project.supervisor_id)
                    return { ...project, created_by: createdBy, supervisor_id: supervisor }
                })
            )
            return { success: true, data: projects }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getProjectById(id) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const snap = await getDoc(doc(db, 'projects', id))
            if (!snap.exists()) throw new Error('Project not found')
            const project = mapDoc(snap)
            const createdBy = await getUserProfile(project.created_by)
            const supervisor = await getSupervisor(project.supervisor_id)
            return { success: true, data: { ...project, created_by: createdBy, supervisor_id: supervisor } }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getProjectsByCategory(category) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'projects'),
                where('category', '==', category),
                orderBy('created_at', 'desc')
            )
            const snapshot = await getDocs(q)
            const projects = await Promise.all(
                snapshot.docs.map(async (snap) => {
                    const project = mapDoc(snap)
                    const createdBy = await getUserProfile(project.created_by)
                    const supervisor = await getSupervisor(project.supervisor_id)
                    return { ...project, created_by: createdBy, supervisor_id: supervisor }
                })
            )
            return { success: true, data: projects }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createProject(projectData) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const payload = { ...projectData, created_at: serverTimestamp() }
            const docRef = await addDoc(collection(db, 'projects'), payload)
            return { success: true, data: [{ id: docRef.id, ...payload }] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getProjectsByCreator(userId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(collection(db, 'projects'), where('created_by', '==', userId))
            const snapshot = await getDocs(q)
            const projects = snapshot.docs
                .map(mapDoc)
                .sort((a, b) => {
                    const aTime = a?.created_at?.toDate?.()?.getTime?.() || 0
                    const bTime = b?.created_at?.toDate?.()?.getTime?.() || 0
                    return bTime - aTime
                })
            return { success: true, data: projects }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateProject(id, updates) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await updateDoc(doc(db, 'projects', id), updates)
            const snap = await getDoc(doc(db, 'projects', id))
            return { success: true, data: [mapDoc(snap)] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async deleteProject(id) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await deleteDoc(doc(db, 'projects', id))
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
