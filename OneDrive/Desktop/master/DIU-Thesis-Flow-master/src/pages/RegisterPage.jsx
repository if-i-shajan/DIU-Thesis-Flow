import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import { authService } from '../services/authService'
import { Alert } from '../components/Alert'
import { BrandLogo } from '../components/BrandLogo'
import {
    User,
    Mail,
    Lock,
    Phone,
    Hash,
    GraduationCap,
    Briefcase,
    Building2,
    CalendarDays,
    ChevronDown,
} from 'lucide-react'

const inputBaseClass =
    'h-11 w-full rounded-[10px] border border-[#E0E7FF] bg-[#F8F9FF] pl-10 pr-3 text-[13.5px] text-[#1A1F36] placeholder:text-[#B0BAD0] outline-none transition-all focus:border-[#2A4DD0] focus:bg-white focus:ring-[3px] focus:ring-[#2A4DD020]'

const getSelectClass = (hasValue) =>
    `h-11 w-full appearance-none rounded-[10px] border border-[#E0E7FF] bg-[#F8F9FF] pl-10 pr-10 text-[13.5px] outline-none transition-all focus:border-[#2A4DD0] focus:bg-white focus:ring-[3px] focus:ring-[#2A4DD018] ${hasValue ? 'text-[#1A1F36]' : 'text-[#B0BAD0]'
    }`

const BANGLADESH_PHONE_REGEX = /^\+8801[3-9]\d{8}$/

const iconClass = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0ABCC]'

const SectionDivider = ({ label }) => (
    <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] uppercase tracking-[1.2px] text-[#8892B0]">{label}</span>
        <div className="h-px flex-1 bg-[#E0E7FF]" />
    </div>
)

const RoleButton = ({ icon: Icon, label, value, selectedRole, onSelect }) => {
    const isActive = selectedRole === value

    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={`flex h-10 items-center justify-center gap-2 rounded-[10px] border text-sm transition-colors ${isActive
                ? 'border-[#2A4DD0] bg-[#EEF2FF] font-medium text-[#2A4DD0]'
                : 'border-[#E0E7FF] bg-[#F8F9FF] font-normal text-[#8892B0] hover:border-[#C9D4FF]'
                }`}
            aria-pressed={isActive}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    )
}

export const RegisterPage = () => {
    const navigate = useNavigate()
    const { setUser, setProfile } = useAuthStore()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        registrationNumber: '',
        phoneNumber: '+88',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
        semesterYear: '',
        designation: '',
        researchAreas: '',
        yearsOfExperience: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    const departments = [
        { label: 'Computer Science', value: 'CS' },
        { label: 'Software Engineering', value: 'SE' },
        { label: 'Information Technology', value: 'IT' },
        { label: 'Artificial Intelligence', value: 'AI' },
        { label: 'Data Science', value: 'DS' },
    ]

    const designations = [
        { label: 'Lecturer', value: 'Lecturer' },
        { label: 'Assistant Professor', value: 'Assistant Professor' },
        { label: 'Professor', value: 'Professor' },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === 'phoneNumber') {
            const sanitized = value.replace(/[^\d+]/g, '')
            const digits = sanitized.replace(/\D/g, '')

            let normalized
            if (digits.startsWith('88')) {
                normalized = `+${digits}`
            } else if (digits.length === 0) {
                normalized = '+88'
            } else {
                normalized = `+88${digits}`
            }

            normalized = normalized.slice(0, 14)
            if (normalized.length < 3) normalized = '+88'

            setFormData({ ...formData, phoneNumber: normalized })
            return
        }

        setFormData({ ...formData, [name]: value })
    }

    const setRole = (role) => {
        setFormData((prev) => ({ ...prev, role }))
    }

    const getPasswordStrength = (password) => {
        let score = 0
        if (password.length >= 8) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        return score
    }

    const passwordStrength = getPasswordStrength(formData.password)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)

        const fullName = `${formData.firstName} ${formData.lastName}`.trim()

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First Name and Last Name are required')
            return
        }

        if (!fullName) {
            setError('Full Name is required')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (!formData.department) {
            setError('Department is required')
            return
        }

        if (!formData.phoneNumber.trim()) {
            setError('Phone Number is required')
            return
        }

        if (!BANGLADESH_PHONE_REGEX.test(formData.phoneNumber.trim())) {
            setError('Phone number must start with +880 and be a valid Bangladesh number')
            return
        }

        if (formData.role === 'student') {
            if (!formData.registrationNumber.trim()) {
                setError('Student ID / Registration Number is required')
                return
            }

            if (!formData.semesterYear.trim()) {
                setError('Semester / Year is required')
                return
            }

            if (Number.isNaN(Number.parseInt(formData.semesterYear, 10))) {
                setError('Semester must be a number')
                return
            }
        }

        if (formData.role === 'supervisor') {
            if (!formData.designation.trim()) {
                setError('Designation is required')
                return
            }

            if (!formData.researchAreas.trim()) {
                setError('Research Areas is required')
                return
            }

            if (!formData.yearsOfExperience.toString().trim()) {
                setError('Years of Experience is required')
                return
            }
        }

        setLoading(true)
        const timeoutId = setTimeout(() => {
            setLoading(false)
            setError('Creating account is taking too long (30+ seconds). Check your connection and try again.')
        }, 30000)

        try {
            const result = await authService.signup(formData.email, formData.password, fullName, formData.role, {
                registrationNumber: formData.registrationNumber,
                studentId: formData.registrationNumber,
                phoneNumber: formData.phoneNumber,
                department: formData.department,
                semesterYear: formData.semesterYear,
                designation: formData.designation,
                researchAreas: formData.researchAreas,
                yearsOfExperience: formData.yearsOfExperience,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.email.split('@')[0] || '',
            })

            if (result.success) {
                if (result.requiresEmailConfirmation) {
                    setSuccessMessage('Registration successful. Please verify your email, then sign in.')
                    navigate('/login')
                    return
                }

                setUser(result.data.user)

                const profileResult = await authService.getUserProfile(result.data.user.uid)
                if (profileResult.success) {
                    setProfile(profileResult.data)

                    const dashboards = {
                        student: '/student/projects',
                        supervisor: '/supervisor/dashboard',
                    }

                    navigate(dashboards[formData.role] || '/student/projects')
                }
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F0F4FF] px-4 py-8">
            <div className="mx-auto w-full max-w-[440px] rounded-[20px] border border-[#E0E7FF] bg-white px-8 py-10 shadow-[0_12px_40px_rgba(42,77,208,0.08)]">
                <div className="mb-6">
                    <BrandLogo className="mb-4" />
                    <p className="text-sm text-[#8892B0]">Create your student or supervisor account</p>
                    <span className="inline-flex rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#2A4DD0]">
                        Step 1 - Basic Information
                    </span>
                </div>

                {error && (
                    <div className="mb-5">
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    </div>
                )}

                {successMessage && (
                    <div className="mb-5">
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <SectionDivider label="Account Type" />
                    <div className="grid grid-cols-2 gap-3">
                        <RoleButton
                            icon={User}
                            label="Student"
                            value="student"
                            selectedRole={formData.role}
                            onSelect={setRole}
                        />
                        <RoleButton
                            icon={Briefcase}
                            label="Supervisor"
                            value="supervisor"
                            selectedRole={formData.role}
                            onSelect={setRole}
                        />
                    </div>

                    <SectionDivider label="Personal Details" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="relative">
                            <label htmlFor="firstName" className="sr-only">
                                First Name
                            </label>
                            <User className={iconClass} />
                            <input
                                id="firstName"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={inputBaseClass}
                                required
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="lastName" className="sr-only">
                                Last Name
                            </label>
                            <User className={iconClass} />
                            <input
                                id="lastName"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={inputBaseClass}
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="email" className="sr-only">
                            Email
                        </label>
                        <Mail className={iconClass} />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputBaseClass}
                            required
                        />
                    </div>

                    <div className={`grid gap-3 ${formData.role === 'student' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {formData.role === 'student' && (
                            <div className="relative">
                                <label htmlFor="registrationNumber" className="sr-only">
                                    Student ID / Registration Number
                                </label>
                                <Hash className={iconClass} />
                                <input
                                    id="registrationNumber"
                                    name="registrationNumber"
                                    placeholder="Student ID / Registration Number"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    className={inputBaseClass}
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <label htmlFor="phoneNumber" className="sr-only">
                                Phone Number
                            </label>
                            <Phone className={iconClass} />
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                placeholder="Enter phone number (e.g., +8801XXXXXXXXX)"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                    if (
                                        (e.key === 'Backspace' || e.key === 'Delete') &&
                                        e.currentTarget.selectionStart <= 3
                                    ) {
                                        e.preventDefault()
                                    }
                                }}
                                onFocus={() => {
                                    if (!formData.phoneNumber || !formData.phoneNumber.startsWith('+88')) {
                                        setFormData({ ...formData, phoneNumber: '+88' })
                                    }
                                }}
                                maxLength={14}
                                className={inputBaseClass}
                                required
                            />
                        </div>
                    </div>

                    <SectionDivider label="Academic Information" />
                    <div className="relative">
                        <label htmlFor="department" className="sr-only">
                            Department
                        </label>
                        <Building2 className={iconClass} />
                        <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0ABCC]"
                            aria-hidden="true"
                        />
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={getSelectClass(Boolean(formData.department))}
                            required
                        >
                            <option value="" disabled selected>
                                Select Department
                            </option>
                            {departments.map((department) => (
                                <option key={department.value} value={department.value}>
                                    {department.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.role === 'student' && (
                        <div className="relative">
                            <label htmlFor="semesterYear" className="sr-only">
                                Semester / Year
                            </label>
                            <CalendarDays className={iconClass} />
                            <input
                                id="semesterYear"
                                name="semesterYear"
                                placeholder="Semester / Year (e.g., 8th Semester, Final Year)"
                                value={formData.semesterYear}
                                onChange={handleChange}
                                className={inputBaseClass}
                                required
                            />
                        </div>
                    )}

                    {formData.role === 'supervisor' && (
                        <>
                            <SectionDivider label="Academic & Professional Information" />
                            <div className="relative">
                                <label htmlFor="designation" className="sr-only">
                                    Designation
                                </label>
                                <Briefcase className={iconClass} />
                                <ChevronDown
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0ABCC]"
                                    aria-hidden="true"
                                />
                                <select
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className={getSelectClass(Boolean(formData.designation))}
                                    required
                                >
                                    <option value="" disabled selected>
                                        Select Designation
                                    </option>
                                    {designations.map((designation) => (
                                        <option key={designation.value} value={designation.value}>
                                            {designation.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <label htmlFor="researchAreas" className="sr-only">
                                    Research Areas
                                </label>
                                <GraduationCap className={iconClass} />
                                <input
                                    id="researchAreas"
                                    name="researchAreas"
                                    placeholder="Research Areas (e.g., AI, Machine Learning, Cybersecurity)"
                                    value={formData.researchAreas}
                                    onChange={handleChange}
                                    className={inputBaseClass}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label htmlFor="yearsOfExperience" className="sr-only">
                                    Years of Experience
                                </label>
                                <Hash className={iconClass} />
                                <input
                                    id="yearsOfExperience"
                                    name="yearsOfExperience"
                                    type="number"
                                    min="0"
                                    placeholder="Years of Experience"
                                    value={formData.yearsOfExperience}
                                    onChange={handleChange}
                                    className={inputBaseClass}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <SectionDivider label="Security" />
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <Lock className={iconClass} />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputBaseClass}
                            required
                        />
                    </div>

                    <div className="mt-1 flex gap-1">
                        {[1, 2, 3, 4].map((level) => {
                            let activeColor = '#E0E7FF'

                            if (passwordStrength >= level) {
                                if (passwordStrength === 1) activeColor = '#E24B4A'
                                if (passwordStrength === 2) activeColor = '#EF9F27'
                                if (passwordStrength === 3) activeColor = '#2A4DD0'
                                if (passwordStrength >= 4) activeColor = '#1D9E75'
                            }

                            return (
                                <span
                                    key={level}
                                    className="h-[3px] flex-1 rounded-[2px]"
                                    style={{ backgroundColor: activeColor }}
                                    aria-hidden="true"
                                />
                            )
                        })}
                    </div>

                    <div className="relative">
                        <label htmlFor="confirmPassword" className="sr-only">
                            Confirm Password
                        </label>
                        <Lock className={iconClass} />
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={inputBaseClass}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 h-[46px] w-full rounded-xl bg-[#2A4DD0] text-sm font-medium text-white transition-colors hover:bg-[#1E3DB5] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>

                    <p className="pt-1 text-center text-sm text-[#8892B0]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-[#2A4DD0] hover:text-[#1E3DB5]">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
