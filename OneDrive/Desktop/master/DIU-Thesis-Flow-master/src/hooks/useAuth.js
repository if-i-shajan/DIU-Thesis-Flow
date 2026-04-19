import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { auth, isFirebaseConfigured } from '../services/firebase'

export const useAuth = () => {
    const { user, profile, setUser, setProfile, setLoading, setError } = useAuthStore()

    useEffect(() => {
        if (!isFirebaseConfigured || !auth) {
            setError('Firebase is not configured. Set valid VITE_FIREBASE_* values in .env.local.')
            setLoading(false)
            return
        }

        checkAuth()

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                const profileResult = await authService.getUserProfile(user.uid)
                if (profileResult.success) {
                    setProfile(profileResult.data)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
        })

        return () => unsubscribe()
    }, [])

    const checkAuth = async () => {
        setLoading(true)
        try {
            const userResult = await authService.getCurrentUser()
            if (userResult.success && userResult.user) {
                setUser(userResult.user)
                const profileResult = await authService.getUserProfile(userResult.user.uid)
                if (profileResult.success) {
                    setProfile(profileResult.data)
                } else {
                    // Profile doesn't exist yet, but user is authenticated
                    console.warn('Profile not found for user:', userResult.user.uid)
                }
            } else {
                // No user logged in
                setUser(null)
                setProfile(null)
            }
        } catch (error) {
            // Silently catch errors on initial load if no user is logged in
            console.debug('Auth check error:', error.message)
            setUser(null)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    return { user, profile }
}
