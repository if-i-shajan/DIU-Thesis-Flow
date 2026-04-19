import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { Alert } from '../components/Alert'
import { Mail, Lock, Eye, EyeOff, User, Briefcase, ShieldCheck, Linkedin } from 'lucide-react'

const inputBaseClass =
    'h-[46px] w-full rounded-[11px] border border-[#E0E7FF] bg-[#F8F9FF] pl-10 pr-11 text-[13.5px] text-[#1A1F36] placeholder:text-[#B0BAD0] outline-none transition-all focus:border-[#2A4DD0] focus:bg-white focus:ring-[3px] focus:ring-[#2A4DD018]'

const demoCredentials = {
    student: {
        role: 'Student',
        email: 'student@example.com',
        password: 'password123',
    },
    supervisor: {
        role: 'Supervisor',
        email: 'supervisor@example.com',
        password: 'password123',
    },
    admin: {
        role: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
    },
}

const roleTabConfig = [
    { key: 'student', label: 'Student', icon: User },
    { key: 'supervisor', label: 'Supervisor', icon: Briefcase },
    { key: 'admin', label: 'Admin', icon: ShieldCheck },
]

const badgeStyles = {
    student: 'bg-[#EEF2FF] text-[#2A4DD0]',
    supervisor: 'bg-[#E1F5EE] text-[#0F6E56]',
    admin: 'bg-[#FAECE7] text-[#993C1D]',
}

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2.1H12z"
        />
        <path
            fill="#34A853"
            d="M12 22c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5C5 19.8 8.2 22 12 22z"
        />
        <path
            fill="#FBBC05"
            d="M6.6 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.4C2.5 9.1 2 10.5 2 12s.5 2.9 1.4 4.5L6.6 14z"
        />
        <path
            fill="#4285F4"
            d="M12 6.1c1.4 0 2.7.5 3.6 1.4l2.7-2.7C16.8 3.3 14.6 2.4 12 2.4c-3.8 0-7 2.2-8.6 5.4l3.2 2.5c.8-2.3 2.9-4.2 5.4-4.2z"
        />
    </svg>
)

export const LoginPage = () => {
    const navigate = useNavigate()
    const { setUser, setProfile } = useAuthStore()
    const [activeRole, setActiveRole] = useState('student')
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [filledRole, setFilledRole] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleSwitch = (role) => {
        setActiveRole(role)
    }

    const handleDemoFill = async (roleKey) => {
        const credential = demoCredentials[roleKey]
        if (!credential) return

        setActiveRole(roleKey)
        setFormData({ email: credential.email, password: credential.password })
        setFilledRole(roleKey)

        try {
            await navigator.clipboard?.writeText(`${credential.email} / ${credential.password}`)
        } catch {
            // Clipboard access can fail on insecure contexts; autofill still works.
        }

        setTimeout(() => {
            setFilledRole(null)
        }, 1500)
    }

    const handleForgotPassword = () => {
        setError('Password reset is not configured yet. Please contact support.')
    }

    const handleSocialLogin = () => {
        setError('Social sign-in is not configured yet.')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const timeoutId = setTimeout(() => {
            setLoading(false)
            setError('Login is taking too long (30+ seconds). Check your connection and try again.')
        }, 30000) // Increased to 30 seconds (database queries can take time)

        try {
            const loginStart = Date.now()
            console.log('[Login] Starting authentication...')

            const result = await authService.login(formData.email, formData.password)
            console.log(`[Login] Auth completed in ${Date.now() - loginStart}ms`, result)

            if (result.success) {
                setUser(result.data.user)

                const profileStart = Date.now()
                console.log('[Login] Fetching user profile...')

                const profileResult = await authService.getUserProfile(result.data.user.uid)
                console.log(`[Login] Profile fetched in ${Date.now() - profileStart}ms`, profileResult)

                if (profileResult.success) {
                    setProfile(profileResult.data)

                    const dashboards = {
                        student: '/student/projects',
                        supervisor: '/supervisor/dashboard',
                        admin: '/admin/dashboard',
                    }

                    console.log(`[Login] Total time: ${Date.now() - loginStart}ms. Redirecting to ${dashboards[profileResult.data.role]}...`)
                    navigate(dashboards[profileResult.data.role] || '/student/projects')
                } else {
                    setError(profileResult.error || 'Failed to load user profile')
                }
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.')
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F4FF] px-4 py-8">
            <div className="w-full max-w-[400px] rounded-[20px] border border-[#E0E7FF] bg-white px-8 pb-8 pt-9 shadow-[0_12px_32px_#2A4DD015]">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#2A4DD0]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 7.8 12 4l8 3.8L12 11.6 4 7.8Z" stroke="white" strokeWidth="1.6" />
                            <path d="M4 12.2 12 16l8-3.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M4 16.2 12 20l8-3.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="text-[21px] font-semibold text-[#1A1F36]">Welcome back</h1>
                    <p className="mt-1 text-[13px] text-[#8892B0]">Sign in to ThesisFlow</p>
                </div>

                {error && (
                    <div className="mb-4">
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    </div>
                )}

                <div className="mb-4 grid grid-cols-3 gap-[6px] rounded-xl bg-[#F0F4FF] p-1">
                    {roleTabConfig.map((role) => {
                        const isActive = activeRole === role.key
                        const Icon = role.icon
                        return (
                            <button
                                key={role.key}
                                type="button"
                                onClick={() => handleRoleSwitch(role.key)}
                                className={`flex h-9 items-center justify-center gap-1.5 rounded-[10px] text-[12.5px] transition-colors ${isActive
                                    ? 'border border-[#E0E7FF] bg-white font-medium text-[#2A4DD0] shadow-[0_1px_4px_#2A4DD015]'
                                    : 'bg-transparent font-normal text-[#8892B0]'
                                    }`}
                                aria-pressed={isActive}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{role.label}</span>
                            </button>
                        )
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0ABCC]" />
                        <label htmlFor="email" className="sr-only">
                            Email or Username
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="text"
                            placeholder="Email / Username / Student ID"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputBaseClass}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0ABCC]" />
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputBaseClass}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0ABCC] transition-colors hover:text-[#2A4DD0]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                        </button>
                    </div>

                    <div className="text-right">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-xs font-medium text-[#2A4DD0] hover:text-[#1E3DB5]"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-[46px] w-full rounded-xl bg-[#2A4DD0] text-sm font-medium tracking-[0.3px] text-white transition-all hover:bg-[#1E3DB5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#E5E9F7]" />
                    <span className="text-xs text-[#B0BAD0]">or continue with</span>
                    <span className="h-px flex-1 bg-[#E5E9F7]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleSocialLogin}
                        className="flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#E0E7FF] bg-[#F8F9FF] text-[13px] text-[#1A1F36] transition-colors hover:border-[#2A4DD0] hover:bg-white"
                    >
                        <GoogleIcon />
                        <span>Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSocialLogin}
                        className="flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#E0E7FF] bg-[#F8F9FF] text-[13px] text-[#1A1F36] transition-colors hover:border-[#2A4DD0] hover:bg-white"
                    >
                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                        <span>LinkedIn</span>
                    </button>
                </div>

                <p className="mt-5 text-center text-[13px] text-[#8892B0]">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-medium text-[#2A4DD0] hover:text-[#1E3DB5]">
                        Sign up
                    </Link>
                </p>
            </div>

            <div className="w-full max-w-[400px] overflow-hidden rounded-[20px] border border-[#E0E7FF] bg-white shadow-[0_10px_24px_#2A4DD015]">
                <div className="flex items-center justify-between border-b border-[#E0E7FF] bg-[#F8F9FF] px-4 py-[10px]">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#E24B4A]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#EF9F27]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1D9E75]" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-[0.6px] text-[#8892B0]">DEMO CREDENTIALS</span>
                </div>

                <div className="space-y-2.5 px-4 py-4">
                    {Object.entries(demoCredentials).map(([key, credential]) => (
                        <div key={key} className="flex items-center gap-2.5">
                            <span
                                className={`inline-flex min-w-[76px] justify-center rounded-full px-2 py-1 text-[10px] font-bold uppercase ${badgeStyles[key]}`}
                            >
                                {credential.role}
                            </span>
                            <span className="flex-1 truncate font-mono text-xs text-[#5A6080]">
                                {credential.email} / {credential.password}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDemoFill(key)}
                                className={`text-[11px] font-medium transition-colors ${filledRole === key ? 'text-[#1D9E75]' : 'text-[#A0ABCC] hover:text-[#2A4DD0]'
                                    }`}
                            >
                                {filledRole === key ? 'filled!' : 'copy'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
