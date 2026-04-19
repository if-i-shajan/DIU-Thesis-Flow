import { getSupabaseClient } from './supabase'

export const projectService = {
    async getProjects() {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('projects')
                .select('*, supervisors(full_name, department)')
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getProjectById(id) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('projects')
                .select('*, supervisors(full_name, department, research_area)')
                .eq('id', id)
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async getProjectsByCategory(category) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('projects')
                .select('*, supervisors(full_name, department)')
                .eq('category', category)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async createProject(projectData) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('projects')
                .insert([projectData])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async updateProject(id, updates) {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async deleteProject(id) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },
}
