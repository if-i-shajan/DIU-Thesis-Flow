import React, { useEffect, useState } from 'react'
import { Alert } from '../Alert'
import { Button } from '../Button'
import { Input, Textarea } from '../FormInputs'
import { Modal } from '../Modal'

const normalizeList = (value = '') =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

export const StudentProfileEditModal = ({
    isOpen,
    onClose,
    profile,
    student,
    onSave,
    isSaving,
}) => {
    const [formError, setFormError] = useState('')
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        student_id: profile?.student_id || '',
        department: profile?.department || '',
        semester: profile?.semester || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
        bio: profile?.bio || '',
        cgpa: student?.cgpa || '',
        standing: student?.standing || '',
        github_url: student?.github_url || '',
        portfolio_url: student?.portfolio_url || '',
        past_project: student?.past_project || '',
        group_name: student?.group_name || '',
        group_members: Array.isArray(student?.group_members) ? student.group_members : [],
        preferred_domains: (student?.preferred_domains || []).join(', '),
        preferred_types: (student?.preferred_types || []).join(', '),
    })

    useEffect(() => {
        if (!isOpen) return

        setForm({
            full_name: profile?.full_name || '',
            student_id: profile?.student_id || '',
            department: profile?.department || '',
            semester: profile?.semester || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || '',
            bio: profile?.bio || '',
            cgpa: student?.cgpa || '',
            standing: student?.standing || '',
            github_url: student?.github_url || '',
            portfolio_url: student?.portfolio_url || '',
            past_project: student?.past_project || '',
            group_name: student?.group_name || '',
            group_members: Array.isArray(student?.group_members) ? student.group_members : [],
            preferred_domains: (student?.preferred_domains || []).join(', '),
            preferred_types: (student?.preferred_types || []).join(', '),
        })
    }, [isOpen, profile, student])

    const onChange = (event) => {
        const { name, value } = event.target
        setForm((previous) => ({ ...previous, [name]: value }))
    }

    const onAvatarChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setFormError('Please upload an image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setForm((previous) => ({ ...previous, avatar_url: String(reader.result || '') }))
            setFormError('')
        }
        reader.onerror = () => {
            setFormError('Could not read the selected image.')
        }
        reader.readAsDataURL(file)
    }

    const handleAddMember = () => {
        setForm((previous) => ({
            ...previous,
            group_members: [
                ...(previous.group_members || []),
                { name: '', id: '', leader: false },
            ],
        }))
    }

    const handleRemoveMember = (index) => {
        setForm((previous) => ({
            ...previous,
            group_members: (previous.group_members || []).filter((_, i) => i !== index),
        }))
    }

    const handleMemberChange = (index, key, value) => {
        setForm((previous) => ({
            ...previous,
            group_members: (previous.group_members || []).map((member, i) => {
                if (i !== index) return member
                return {
                    ...member,
                    [key]: key === 'leader' ? Boolean(value) : value,
                }
            }),
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError('')

        if (!form.full_name.trim()) {
            setFormError('Full name is required.')
            return
        }

        if (!form.department.trim()) {
            setFormError('Department is required.')
            return
        }

        const phone = form.phone.trim()
        if (phone && !phone.startsWith('+880')) {
            setFormError('Phone must follow +880 format.')
            return
        }

        const payload = {
            ...form,
            group_members: (form.group_members || []).filter(
                (member) => member?.name?.trim() || member?.id?.trim(),
            ),
            preferred_domains: normalizeList(form.preferred_domains),
            preferred_types: normalizeList(form.preferred_types),
        }

        const result = await onSave(payload)
        if (!result?.success) {
            setFormError(result?.error || 'Failed to save profile updates.')
            return
        }

        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Profile" size="xl">
            {formError && <Alert type="error" message={formError} />}
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Profile Photo</label>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                            {form.avatar_url ? (
                                <img src={form.avatar_url} alt="Profile preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">No Photo</div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onAvatarChange}
                            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <Input label="Full Name" name="full_name" value={form.full_name} onChange={onChange} />
                <Input label="Student ID" name="student_id" value={form.student_id} onChange={onChange} />
                <Input label="Department" name="department" value={form.department} onChange={onChange} />
                <Input label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={onChange} />
                <Input label="Phone (+880...)" name="phone" value={form.phone} onChange={onChange} />
                <Input label="CGPA" name="cgpa" type="number" step="0.01" min="0" max="4" value={form.cgpa} onChange={onChange} />
                <Input label="Standing" name="standing" value={form.standing} onChange={onChange} />
                <Input label="GitHub URL" name="github_url" value={form.github_url} onChange={onChange} />
                <Input label="Portfolio URL" name="portfolio_url" value={form.portfolio_url} onChange={onChange} />
                <Input label="Past Project" name="past_project" value={form.past_project} onChange={onChange} />
                <Input label="Group Name" name="group_name" value={form.group_name} onChange={onChange} />
                <div className="md:col-span-2">
                    <Textarea
                        label="Short Bio"
                        name="bio"
                        rows={3}
                        value={form.bio}
                        onChange={onChange}
                    />
                </div>
                <div className="md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">Group Members</label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddMember}>
                            Add Member
                        </Button>
                    </div>
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        {(form.group_members || []).length === 0 && (
                            <p className="text-sm text-gray-500">No members added yet.</p>
                        )}
                        {(form.group_members || []).map((member, index) => (
                            <div key={`${index}-${member.id || 'member'}`} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-white p-3 md:grid-cols-12">
                                <div className="md:col-span-5">
                                    <input
                                        type="text"
                                        value={member.name || ''}
                                        onChange={(event) => handleMemberChange(index, 'name', event.target.value)}
                                        placeholder="Member name"
                                        className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <input
                                        type="text"
                                        value={member.id || ''}
                                        onChange={(event) => handleMemberChange(index, 'id', event.target.value)}
                                        placeholder="Student ID"
                                        className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <input
                                        id={`leader-${index}`}
                                        type="checkbox"
                                        checked={Boolean(member.leader)}
                                        onChange={(event) => handleMemberChange(index, 'leader', event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`leader-${index}`} className="text-sm text-gray-700">Leader</label>
                                </div>
                                <div className="md:col-span-2">
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleRemoveMember(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <Input
                        label="Preferred Domains (comma-separated)"
                        name="preferred_domains"
                        value={form.preferred_domains}
                        onChange={onChange}
                    />
                </div>
                <div className="md:col-span-2">
                    <Input
                        label="Preferred Project Types (comma-separated)"
                        name="preferred_types"
                        value={form.preferred_types}
                        onChange={onChange}
                    />
                </div>

                <div className="md:col-span-2 mt-2 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
