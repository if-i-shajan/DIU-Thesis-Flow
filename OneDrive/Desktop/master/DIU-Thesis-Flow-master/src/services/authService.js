import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore'
import { auth, db } from './firebase'

const ALLOWED_SIGNUP_ROLES = ['student', 'supervisor']
const BANGLADESH_PHONE_REGEX = /^\+88\d{10,}$/  // More lenient: +88 followed by at least 10 digits

export const authService = {
    async signup(email, password, fullName, role = 'student', additionalInfo = {}) {
        try {
            if (!auth || !db) {
                return { success: false, error: 'Firebase is not configured.' }
            }
            const normalizedEmail = String(email || '').trim().toLowerCase()
            const normalizedPassword = String(password || '').trim()

            if (!normalizedEmail || !normalizedPassword) {
                return { success: false, error: 'Email and password are required.' }
            }
            const normalizedRole = (role || 'student').toLowerCase()
            if (!ALLOWED_SIGNUP_ROLES.includes(normalizedRole)) {
                return {
                    success: false,
                    error: 'Invalid role selected. Please choose Student or Supervisor.',
                }
            }

            const registrationNumber = (additionalInfo.registrationNumber || '').trim()
            const phoneNumber = (additionalInfo.phoneNumber || '+88').trim()
            const department = (additionalInfo.department || '').trim()
            const semesterYear = (additionalInfo.semesterYear || '').trim()
            const designation = (additionalInfo.designation || '').trim()
            const researchAreas = (additionalInfo.researchAreas || '').trim()
            const yearsOfExperience = (additionalInfo.yearsOfExperience || '').toString().trim()
            const firstName = (additionalInfo.firstName || '').trim()
            const lastName = (additionalInfo.lastName || '').trim()
            const providedUsername = (additionalInfo.username || '').trim()
            const derivedUsername = normalizedEmail.split('@')[0]
            const username = (providedUsername || derivedUsername || '').toLowerCase()
            const studentId = (additionalInfo.studentId || registrationNumber || '').trim()
            const semesterNumber = Number.parseInt(semesterYear, 10)

            // Only validate phone if provided and not just the prefix
            if (phoneNumber && phoneNumber !== '+88' && !BANGLADESH_PHONE_REGEX.test(phoneNumber)) {
                return {
                    success: false,
                    error: 'Phone number must start with +88 and have at least 10 digits',
                }
            }

            if (!department) {
                return {
                    success: false,
                    error: 'Please select a department.',
                }
            }

            if (normalizedRole === 'student' && (!registrationNumber || !semesterYear)) {
                return {
                    success: false,
                    error: 'Please fill in registration number and semester/year.',
                }
            }

            if (normalizedRole === 'student' && Number.isNaN(semesterNumber)) {
                return {
                    success: false,
                    error: 'Semester must be a number.',
                }
            }

            if (normalizedRole === 'supervisor' && (!designation || !researchAreas)) {
                return {
                    success: false,
                    error: 'Please fill in designation and research areas.',
                }
            }

            const metadata = {
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                username,
                student_id: studentId || null,
                phone: phoneNumber,
                department,
                semester: Number.isNaN(semesterNumber) ? null : semesterNumber,
                role: normalizedRole,
            }

            if (normalizedRole === 'student') {
                metadata.registration_number = registrationNumber
            }

            if (normalizedRole === 'supervisor') {
                metadata.designation = designation
                metadata.research_areas = researchAreas
                metadata.years_of_experience = yearsOfExperience
            }

            const credential = await createUserWithEmailAndPassword(
                auth,
                normalizedEmail,
                normalizedPassword,
            )

            console.log('[Signup] Firebase auth response', credential)

            const profilePayload = {
                id: credential.user.uid,
                email: normalizedEmail,
                username,
                student_id: studentId || null,
                first_name: firstName || null,
                last_name: lastName || null,
                phone: phoneNumber || null,
                role: normalizedRole,
                department: department || null,
                semester: Number.isNaN(semesterNumber) ? null : semesterNumber,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            }

            await setDoc(doc(db, 'user_profiles', credential.user.uid), profilePayload, { merge: true })

            if (normalizedRole === 'student') {
                const studentPayload = {
                    id: credential.user.uid,
                    user_id: credential.user.uid,
                    registration_number: registrationNumber || null,
                    department: department || null,
                    semester: Number.isNaN(semesterNumber) ? null : semesterNumber,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                }
                await setDoc(doc(db, 'students', credential.user.uid), studentPayload, { merge: true })
            }

            if (normalizedRole === 'supervisor') {
                const supervisorPayload = {
                    id: credential.user.uid,
                    user_id: credential.user.uid,
                    department: department || null,
                    designation: designation || null,
                    research_area: researchAreas || null,
                    years_of_experience: yearsOfExperience || null,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                }
                await setDoc(doc(db, 'supervisors', credential.user.uid), supervisorPayload, { merge: true })
            }

            console.log('[Signup] Profile upsert', profilePayload)

            return {
                success: true,
                data: { user: credential.user },
                requiresEmailConfirmation: false,
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async login(email, password) {
        try {
            if (!auth || !db) {
                return { success: false, error: 'Firebase is not configured.' }
            }
            const normalizedEmail = (email || '').trim().toLowerCase()
            const normalizedPassword = (password || '').trim()

            if (!normalizedEmail || !normalizedPassword) {
                return { success: false, error: 'Email and password are required.' }
            }

            let loginEmail = String(normalizedEmail)
            if (!loginEmail.includes('@')) {
                const profilesRef = collection(db, 'user_profiles')
                const usernameQuery = query(profilesRef, where('username', '==', loginEmail))
                const studentIdQuery = query(profilesRef, where('student_id', '==', loginEmail))

                const [usernameSnap, studentIdSnap] = await Promise.all([
                    getDocs(usernameQuery),
                    getDocs(studentIdQuery),
                ])

                const usernameDoc = usernameSnap.docs[0]
                const studentDoc = studentIdSnap.docs[0]
                const resolvedDoc = usernameDoc || studentDoc

                console.log('[Login] Identifier lookup', {
                    loginEmail,
                    usernameFound: Boolean(usernameDoc),
                    studentIdFound: Boolean(studentDoc),
                })

                if (!resolvedDoc?.data()?.email) {
                    return { success: false, error: 'No account found for that username or student ID.' }
                }
                loginEmail = resolvedDoc.data().email
            }
            console.log('[Login] Firebase auth input', { loginEmail, hasPassword: Boolean(normalizedPassword) })
            const credential = await signInWithEmailAndPassword(auth, loginEmail, normalizedPassword)
            console.log('[Login] Firebase auth response', credential)
            return { success: true, data: { user: credential.user } }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async logout() {
        try {
            if (!auth) {
                return { success: false, error: 'Firebase is not configured.' }
            }
            await signOut(auth)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getCurrentUser() {
        try {
            if (!auth) {
                return { success: false, error: 'Firebase is not configured.' }
            }
            return { success: true, user: auth.currentUser }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getUserProfile(userId) {
        try {
            if (!db || !auth) {
                return { success: false, error: 'Firebase is not configured.' }
            }

            const profileRef = doc(db, 'user_profiles', userId)
            const profileSnap = await getDoc(profileRef)

            if (profileSnap.exists()) {
                return { success: true, data: { id: userId, ...profileSnap.data() } }
            }

            const user = auth.currentUser
            if (!user || user.uid !== userId) {
                return { success: false, error: 'User profile not found.' }
            }

            const fallbackUsername = (user.email?.split('@')[0] || '').toLowerCase()
            const createdProfile = {
                id: user.uid,
                email: user.email || '',
                username: fallbackUsername,
                student_id: null,
                first_name: null,
                last_name: null,
                phone: null,
                role: 'student',
                department: null,
                semester: null,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            }

            await setDoc(profileRef, createdProfile, { merge: true })
            return { success: true, data: createdProfile }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
