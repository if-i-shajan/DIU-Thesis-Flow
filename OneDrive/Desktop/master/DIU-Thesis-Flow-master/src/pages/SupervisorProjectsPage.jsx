import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../context/store'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input, Select, Textarea } from '../components/FormInputs'
import { Container, Grid, Section } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProjectCard } from '../components/ProjectCard'
import { projectService } from '../services/projectService'
import { supervisorService } from '../services/supervisorService'
import { Lightbulb, PlusCircle } from 'lucide-react'

const categories = ['AI/ML', 'Web Development', 'Mobile Development', 'IoT', 'Data Science', 'Security']

const isYouTubeLink = (value) => {
    try {
        const parsed = new URL(value)
        return (
            parsed.hostname.includes('youtube.com') ||
            parsed.hostname.includes('youtu.be')
        )
    } catch {
        return false
    }
}

export const SupervisorProjectsPage = () => {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [projects, setProjects] = useState([])
    const [supervisor, setSupervisor] = useState(null)

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: categories[0],
        video_link: '',
    })

    useEffect(() => {
        if (!user?.uid) return
        loadPageData()
    }, [user?.uid])

    const loadPageData = async () => {
        setLoading(true)
        setError('')

        const [supervisorResult, projectsResult] = await Promise.all([
            supervisorService.getSupervisorByUserId(user.uid),
            projectService.getProjectsByCreator(user.uid),
        ])

        if (!supervisorResult.success) {
            setError(supervisorResult.error || 'Failed to load supervisor profile.')
        }

        if (!projectsResult.success) {
            setError(projectsResult.error || 'Failed to load project ideas.')
        }

        setSupervisor(supervisorResult.data || null)
        setProjects(projectsResult.data || [])
        setLoading(false)
    }

    const onChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            category: categories[0],
            video_link: '',
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!form.title.trim()) {
            setError('Project title is required.')
            return
        }

        if (!form.description.trim()) {
            setError('Project description is required.')
            return
        }

        if (!form.category) {
            setError('Project category is required.')
            return
        }

        if (!form.video_link.trim() || !isYouTubeLink(form.video_link.trim())) {
            setError('Please provide a valid YouTube link.')
            return
        }

        setSubmitting(true)

        const result = await projectService.createProject({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            video_link: form.video_link.trim(),
            status: 'available',
            created_by: user.uid,
            supervisor_id: supervisor?.id || user.uid,
        })

        setSubmitting(false)

        if (!result.success) {
            setError(result.error || 'Failed to create project idea.')
            return
        }

        setSuccess('Project idea added successfully.')
        resetForm()
        await loadPageData()
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section
                    title="Supervisor Project Ideas"
                    subtitle="Add new thesis project ideas for students"
                >
                    {error && (
                        <div className="mb-5">
                            <Alert type="error" message={error} onClose={() => setError('')} />
                        </div>
                    )}

                    {success && (
                        <div className="mb-5">
                            <Alert type="success" message={success} onClose={() => setSuccess('')} />
                        </div>
                    )}

                    <Card hover={false} className="mb-8">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                            <PlusCircle className="h-5 w-5 text-blue-600" />
                            Add New Project Idea
                        </h3>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Input
                                    label="Title"
                                    name="title"
                                    value={form.title}
                                    onChange={onChange}
                                    placeholder="AI-Based Face Recognition System"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Description"
                                    name="description"
                                    rows={4}
                                    value={form.description}
                                    onChange={onChange}
                                    placeholder="Describe scope, objectives, and expected outcomes."
                                />
                            </div>

                            <Select
                                label="Category"
                                name="category"
                                options={categories.map((cat) => ({ label: cat, value: cat }))}
                                value={form.category}
                                onChange={onChange}
                            />

                            <Input
                                label="YouTube Video Link"
                                name="video_link"
                                value={form.video_link}
                                onChange={onChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={submitting} className="inline-flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    {submitting ? 'Adding...' : 'Add Project Idea'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <h3 className="mb-4 text-lg font-bold text-gray-900">My Submitted Ideas ({projects.length})</h3>
                    {projects.length === 0 ? (
                        <Card hover={false} className="text-center py-10 text-gray-500">
                            No project ideas yet. Add your first idea above.
                        </Card>
                    ) : (
                        <Grid columns={3}>
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onViewDetails={() => { }}
                                />
                            ))}
                        </Grid>
                    )}
                </Section>
            </Container>
        </div>
    )
}
