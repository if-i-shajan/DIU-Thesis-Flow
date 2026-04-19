import React from 'react'
import { Loader } from 'lucide-react'

export const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    }

    const spinner = (
        <div className="flex items-center justify-center">
            <Loader className={`${sizes[size]} text-blue-600 animate-spin`} />
        </div>
    )

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {spinner}
            </div>
        )
    }

    return spinner
}
