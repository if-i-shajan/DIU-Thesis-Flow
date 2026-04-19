import React from 'react'

export const SupervisorDashboardCard = ({ title, action, children, className = '' }) => {
    return (
        <section className={`bg-white rounded-2xl border border-[#D7E1FF] shadow-soft p-5 ${className}`}>
            {(title || action) && (
                <header className="mb-4 flex items-center justify-between gap-3">
                    {title && <h2 className="text-base font-semibold text-[#1A2756]">{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    )
}

export const SupervisorTag = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-[#E3EBFF] px-3 py-1 text-xs font-semibold text-[#2A4DD0]">
        {children}
    </span>
)

export const RequestStatusBadge = ({ status }) => {
    const normalized = String(status || 'pending').toLowerCase()
    const styles = {
        pending: 'bg-amber-100 text-amber-700',
        accepted: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[normalized] || styles.pending}`}>
            {normalized}
        </span>
    )
}
