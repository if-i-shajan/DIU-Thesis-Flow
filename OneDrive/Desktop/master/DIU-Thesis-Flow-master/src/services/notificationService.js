import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() })

export const notificationService = {
    async getNotifications(userId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'notifications'),
                where('user_id', '==', userId),
                orderBy('created_at', 'desc')
            )
            const snapshot = await getDocs(q)
            return { success: true, data: snapshot.docs.map(mapDoc) }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async markAsRead(notificationId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await updateDoc(doc(db, 'notifications', notificationId), { is_read: true })
            return { success: true, data: [] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createNotification(userId, message, type = 'info') {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const payload = {
                user_id: userId,
                message,
                type,
                is_read: false,
                created_at: serverTimestamp(),
            }
            const docRef = await addDoc(collection(db, 'notifications'), payload)
            return { success: true, data: [{ id: docRef.id, ...payload }] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async deleteNotification(notificationId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            await deleteDoc(doc(db, 'notifications', notificationId))
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getUnreadCount(userId) {
        try {
            if (!db) throw new Error('Firebase is not configured.')
            const q = query(
                collection(db, 'notifications'),
                where('user_id', '==', userId),
                where('is_read', '==', false)
            )
            const snapshot = await getDocs(q)
            return { success: true, count: snapshot.size }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
