import { getSupabaseClient } from './supabase'

export const supervisorService = {
    async getSupervisors() {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisors')
                .select('*, user_profiles(full_name, email)')
                .order('department', { ascending: true })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getSupervisorById(id) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisors')
                .select('*, user_profiles(full_name, email)')
                .eq('id', id)
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getSupervisorsByDepartment(department) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisors')
                .select('*, user_profiles(full_name, email)')
                .eq('department', department)

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createSupervisor(supervisorData) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisors')
                .insert([supervisorData])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateSupervisor(id, updates) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisors')
                .update(updates)
                .eq('id', id)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
