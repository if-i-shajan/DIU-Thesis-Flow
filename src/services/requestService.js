import { getSupabaseClient } from './supabase'

export const requestService = {
    async sendRequest(studentId, supervisorId) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisor_requests')
                .insert([
                    {
                        student_id: studentId,
                        supervisor_id: supervisorId,
                        status: 'pending',
                    },
                ])
                .select()

            if (error) throw error

            // Create notification for supervisor
            await supabase.from('notifications').insert([
                {
                    user_id: supervisorId,
                    message: `New supervisor request from student ${studentId}`,
                    type: 'request',
                    is_read: false,
                },
            ])

            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestsForSupervisor(supervisorId) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisor_requests')
                .select('*, students(user_id, department), user_profiles(full_name, email)')
                .eq('supervisor_id', supervisorId)

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestsForStudent(studentId) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisor_requests')
                .select('*, supervisors(user_id, department, research_area)')
                .eq('student_id', studentId)

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateRequest(id, status) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisor_requests')
                .update({ status })
                .eq('id', id)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getRequestStatus(studentId, supervisorId) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('supervisor_requests')
                .select('status')
                .eq('student_id', studentId)
                .eq('supervisor_id', supervisorId)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
