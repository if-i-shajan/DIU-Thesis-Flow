import React from 'react'

export const Card = ({ children, className = '', onClick, hover = true }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''
                } ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 pb-4 border-b border-gray-200 ${className}`}>
        {children}
    </div>
)

export const CardBody = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
)

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
        {children}
    </div>
)
