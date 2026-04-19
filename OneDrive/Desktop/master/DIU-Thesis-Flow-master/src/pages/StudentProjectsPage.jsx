import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { projectService } from '../services/projectService'
import { supervisorService } from '../services/supervisorService'
import { requestService } from '../services/requestService'
import { notificationService } from '../services/notificationService'
import { Container, Section, Grid } from '../components/Layout'
import { ProjectCard } from '../components/ProjectCard'
import { Input, Select } from '../components/FormInputs'
import { Button } from '../components/Button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Search, Filter } from 'lucide-react'

export const StudentProjectsPage = () => {
    const { user, profile } = useAuthStore()
    const [projects, setProjects] = useState([])
    const [filteredProjects, setFilteredProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const categories = ['AI', 'Web Development', 'Mobile Development', 'Machine Learning', 'IoT', 'Security']

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        filterProjects()
    }, [projects, searchTerm, selectedCategory])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const result = await projectService.getProjects()
            if (result.success) {
                setProjects(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    const filterProjects = () => {
        let filtered = projects

        if (selectedCategory) {
            filtered = filtered.filter((p) => p.category === selectedCategory)
        }

        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredProjects(filtered)
    }

    const handleSelectSupervisor = async (projectId) => {
        try {
            const project = projects.find((p) => p.id === projectId)
            if (project) {
                // Send request to supervisor
                const result = await requestService.sendRequest(user.uid, project.created_by?.id || project.created_by)

                if (result.success) {
                    setSuccessMessage('Request sent successfully!')
                    setTimeout(() => setSuccessMessage(''), 3000)
                } else {
                    setError(result.error)
                }
            }
        } catch (err) {
            setError('Failed to send request')
        }
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section
                    title="Explore Project Ideas"
                    subtitle="Browse and select from available thesis projects"
                >
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6">
                            <Alert type="success" message={successMessage} />
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4 md:flex gap-4 md:space-y-0">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <Select
                            options={[
                                { label: 'All Categories', value: '' },
                                ...categories.map((cat) => ({ label: cat, value: cat })),
                            ]}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full md:w-48"
                        />
                    </div>

                    {/* Projects Grid */}
                    {filteredProjects.length > 0 ? (
                        <Grid columns={3}>
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onSelectSupervisor={handleSelectSupervisor}
                                />
                            ))}
                        </Grid>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No projects found</p>
                        </div>
                    )}
                </Section>
            </Container>
        </div>
    )
}
