import React from 'react'

export const Input = ({ label, error, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none ${error
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                {...props}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )
}

export const Select = ({ label, error, options, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none ${error
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                {...props}
            >
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )
}

export const Textarea = ({ label, error, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none resize-none ${error
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                {...props}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )
}
