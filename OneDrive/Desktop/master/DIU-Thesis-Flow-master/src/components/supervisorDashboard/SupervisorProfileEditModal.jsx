import React, { useEffect, useState } from 'react'
import { Alert } from '../Alert'
import { Button } from '../Button'
import { Input, Textarea } from '../FormInputs'
import { Modal } from '../Modal'

const parseList = (value = '') =>
    value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)

export const SupervisorProfileEditModal = ({
    isOpen,
    onClose,
    profile,
    supervisor,
    onSave,
    isSaving,
}) => {
    const [formError, setFormError] = useState('')
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        department: supervisor?.department || profile?.department || '',
        designation: supervisor?.designation || '',
        years_of_experience: supervisor?.years_of_experience || '',
        research_area: supervisor?.research_area || '',
        preferred_project_domains: (supervisor?.preferred_project_domains || []).join(', '),
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
    })

    useEffect(() => {
        if (!isOpen) return

        setForm({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            department: supervisor?.department || profile?.department || '',
            designation: supervisor?.designation || '',
            years_of_experience: supervisor?.years_of_experience || '',
            research_area: supervisor?.research_area || '',
            preferred_project_domains: (supervisor?.preferred_project_domains || []).join(', '),
            bio: profile?.bio || '',
            avatar_url: profile?.avatar_url || '',
        })
        setFormError('')
    }, [isOpen, profile, supervisor])

    const onChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const onAvatarChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setFormError('Please upload a valid image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setForm((prev) => ({ ...prev, avatar_url: String(reader.result || '') }))
            setFormError('')
        }
        reader.onerror = () => setFormError('Could not read selected image.')
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError('')

        if (!form.full_name.trim()) {
            setFormError('Full name is required.')
            return
        }

        if (!form.designation.trim()) {
            setFormError('Designation is required.')
            return
        }

        if (!form.department.trim()) {
            setFormError('Department is required.')
            return
        }

        if (!form.research_area.trim()) {
            setFormError('Research area is required.')
            return
        }

        if (form.phone && !String(form.phone).startsWith('+880')) {
            setFormError('Phone must follow +880 format.')
            return
        }

        const payload = {
            ...form,
            preferred_project_domains: parseList(form.preferred_project_domains),
        }

        const result = await onSave(payload)
        if (!result?.success) {
            setFormError(result?.error || 'Failed to update supervisor profile.')
            return
        }

        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Supervisor Profile" size="xl">
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
                <Input label="Designation" name="designation" value={form.designation} onChange={onChange} />
                <Input label="Department" name="department" value={form.department} onChange={onChange} />
                <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    name="years_of_experience"
                    value={form.years_of_experience}
                    onChange={onChange}
                />
                <Input label="Phone (+880...)" name="phone" value={form.phone} onChange={onChange} />
                <Input label="Research Area(s)" name="research_area" value={form.research_area} onChange={onChange} />

                <div className="md:col-span-2">
                    <Input
                        label="Preferred Project Domains (comma-separated)"
                        name="preferred_project_domains"
                        value={form.preferred_project_domains}
                        onChange={onChange}
                    />
                </div>

                <div className="md:col-span-2">
                    <Textarea label="Short Bio" rows={3} name="bio" value={form.bio} onChange={onChange} />
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
