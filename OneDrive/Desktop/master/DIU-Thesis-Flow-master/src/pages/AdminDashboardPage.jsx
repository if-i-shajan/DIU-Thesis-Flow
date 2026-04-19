import React, { useState, useEffect } from 'react'
import { Container, Section } from '../components/Layout'
import { projectService } from '../services/projectService'
import { supervisorService } from '../services/supervisorService'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Users, BookOpen, Settings } from 'lucide-react'

export const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        projects: 0,
        supervisors: 0,
        users: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const [projectsResult, supervisorsResult, usersSnap] = await Promise.all([
                projectService.getProjects(),
                supervisorService.getSupervisors(),
                getDocs(collection(db, 'user_profiles')),
            ])

            const allUsers = usersSnap.docs.map((snap) => snap.data())
            const activeStudents = allUsers.filter((user) => (user.role || '').toLowerCase() === 'student')

            setStats({
                projects: projectsResult.data?.length || 0,
                supervisors: supervisorsResult.data?.length || 0,
                users: activeStudents.length > 0 ? activeStudents.length : allUsers.length,
            })
        } catch (err) {
            console.error('Failed to fetch stats')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSpinner fullPage />

    const statCards = [
        {
            title: 'Total Projects',
            value: stats.projects,
            icon: BookOpen,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Total Supervisors',
            value: stats.supervisors,
            icon: Users,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Registered Users',
            value: stats.users,
            icon: Users,
            color: 'bg-purple-100 text-purple-600',
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section title="Admin Dashboard" subtitle="System overview and management">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {statCards.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <Card key={stat.title} className="text-center">
                                    <div className={`w-16 h-16 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <a
                                    href="/admin/users"
                                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-semibold transition-colors"
                                >
                                    Manage Users
                                </a>
                                <a
                                    href="/admin/projects"
                                    className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-semibold transition-colors"
                                >
                                    Manage Projects
                                </a>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Database</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Online</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">API</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Online</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Section>
            </Container>
        </div>
    )
}
