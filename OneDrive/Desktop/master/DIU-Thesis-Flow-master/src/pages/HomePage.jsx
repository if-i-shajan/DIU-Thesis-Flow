import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Section } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react'

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                University ThesisFlow
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Streamline your final year project selection process. Connect students with supervisors,
                                manage projects, and track progress all in one platform.
                            </p>
                            <div className="flex gap-4">
                                <Link to="/login">
                                    <Button variant="primary" size="lg">
                                        Get Started <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="outline" size="lg">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-full max-w-md h-80 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl shadow-2xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="text-6xl font-bold mb-2">TMS</div>
                                    <p className="text-xl opacity-80">Thesis Management</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <Container>
                    <Section
                        title="Key Features"
                        subtitle="Everything you need for successful thesis management"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'Project Browsing',
                                    description: 'Browse and explore available thesis projects with detailed descriptions and video presentations.',
                                    color: 'blue',
                                },
                                {
                                    icon: Users,
                                    title: 'Supervisor Matching',
                                    description: 'Find the perfect supervisor based on expertise, department, and research interests.',
                                    color: 'green',
                                },
                                {
                                    icon: Zap,
                                    title: 'Request Management',
                                    description: 'Send requests, track status, and manage supervisor assignments in real-time.',
                                    color: 'purple',
                                },
                            ].map((feature, index) => {
                                const Icon = feature.icon
                                const colors = {
                                    blue: 'bg-blue-100 text-blue-600',
                                    green: 'bg-green-100 text-green-600',
                                    purple: 'bg-purple-100 text-purple-600',
                                }
                                return (
                                    <Card key={index}>
                                        <div className={`w-12 h-12 ${colors[feature.color]} rounded-lg flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </Card>
                                )
                            })}
                        </div>
                    </Section>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
                <Container>
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of students and supervisors using our platform
                        </p>
                        <Link to="/register">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                Create Your Account Now
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>
        </div>
    )
}
