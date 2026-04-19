import React from 'react'

export const StudentDashboardCard = ({ title, action, children, className = '' }) => {
    return (
        <section className={`bg-white rounded-2xl border border-[#D7E1FF] shadow-soft p-5 ${className}`}>
            {(title || action) && (
                <header className="mb-4 flex items-center justify-between gap-4">
                    {title && <h2 className="text-base font-semibold text-[#1A2756]">{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    )
}

export const StudentTag = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-[#E3EBFF] px-3 py-1 text-xs font-semibold text-[#2A4DD0]">
        {children}
    </span>
)

export const StatusPill = ({ status }) => {
    const normalized = (status || 'pending').toLowerCase()
    const styleMap = {
        accepted: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
    }

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styleMap[normalized] || styleMap.pending}`}>
            {normalized}
        </span>
    )
}
