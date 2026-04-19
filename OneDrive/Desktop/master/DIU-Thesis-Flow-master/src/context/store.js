import { create } from 'zustand'

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    error: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    logout: () => set({ user: null, profile: null }),
}))

export const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    })),
    setUnreadCount: (count) => set({ unreadCount: count }),
}))

export const useProjectStore = create((set) => ({
    projects: [],
    selectedProject: null,
    filter: {
        category: null,
        search: null,
    },

    setProjects: (projects) => set({ projects }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter },
    })),
}))

export const useSupervisorStore = create((set) => ({
    supervisors: [],
    filter: {
        department: null,
        search: null,
    },

    setSupervisors: (supervisors) => set({ supervisors }),
    setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter },
    })),
}))
