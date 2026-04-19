import { getSupabaseClient } from './supabase'

const ALLOWED_SIGNUP_ROLES = ['student', 'supervisor']
const BANGLADESH_PHONE_REGEX = /^\+8801[3-9]\d{8}$/

export const authService = {
    async signup(email, password, fullName, role = 'student', additionalInfo = {}) {
        try {
            const supabase = getSupabaseClient()
            const normalizedRole = (role || 'student').toLowerCase()
            if (!ALLOWED_SIGNUP_ROLES.includes(normalizedRole)) {
                return {
                    success: false,
                    error: 'Invalid role selected. Please choose Student or Supervisor.',
                }
            }

            const registrationNumber = (additionalInfo.registrationNumber || '').trim()
            const phoneNumber = (additionalInfo.phoneNumber || '').trim()
            const department = (additionalInfo.department || '').trim()
            const semesterYear = (additionalInfo.semesterYear || '').trim()
            const designation = (additionalInfo.designation || '').trim()
            const researchAreas = (additionalInfo.researchAreas || '').trim()
            const yearsOfExperience = (additionalInfo.yearsOfExperience || '').toString().trim()

            if (!phoneNumber || !department) {
                return {
                    success: false,
                    error: 'Please fill in all required registration fields.',
                }
            }

            if (!BANGLADESH_PHONE_REGEX.test(phoneNumber)) {
                return {
                    success: false,
                    error: 'Phone number must start with +880 and be a valid Bangladesh number',
                }
            }

            if (normalizedRole === 'student' && (!registrationNumber || !semesterYear)) {
                return {
                    success: false,
                    error: 'Please fill in all required student fields.',
                }
            }

            if (normalizedRole === 'supervisor' && (!designation || !researchAreas || !yearsOfExperience)) {
                return {
                    success: false,
                    error: 'Please fill in all required supervisor fields.',
                }
            }

            const metadata = {
                phone_number: phoneNumber,
                department,
                role: normalizedRole,
            }

            if (normalizedRole === 'student') {
                metadata.registration_number = registrationNumber
                metadata.semester_year = semesterYear
            }

            if (normalizedRole === 'supervisor') {
                metadata.designation = designation
                metadata.research_areas = researchAreas
                metadata.years_of_experience = yearsOfExperience
            }

            // Sign up user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            })

            if (error) throw error

            // Create user profile
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: data.user.id,
                            email,
                            full_name: fullName,
                            role: normalizedRole,
                        },
                    ])

                if (profileError) throw profileError
            }

            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async login(email, password) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async logout() {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getCurrentUser() {
        try {
            const supabase = getSupabaseClient()
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            if (error) throw error
            return { success: true, user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getUserProfile(userId) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
