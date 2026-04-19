import React from 'react'

export const Container = ({ children, maxWidth = 'max-w-7xl', className = '' }) => {
    return (
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </div>
    )
}

export const Section = ({ title, subtitle, children, className = '' }) => {
    return (
        <section className={`py-8 ${className}`}>
            {title && (
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>
            )}
            {children}
        </section>
    )
}

export const Grid = ({ children, columns = 3, gap = 6 }) => {
    const colClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }

    const gapClass = {
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    }

    return (
        <div className={`grid ${colClass[columns]} ${gapClass[gap]}`}>
            {children}
        </div>
    )
}
