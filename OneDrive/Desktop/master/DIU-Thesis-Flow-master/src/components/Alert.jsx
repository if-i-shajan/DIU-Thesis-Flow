import React from 'react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export const Alert = ({ type = 'info', title, message, onClose }) => {
    const styles = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: Info,
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircle,
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: AlertCircle,
        },
    }

    const style = styles[type]
    const Icon = style.icon

    return (
        <div className={`${style.bg} ${style.border} border rounded-lg p-4 ${style.text} flex items-start gap-3`}>
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                {title && <h3 className="font-semibold mb-1">{title}</h3>}
                {message && <p className="text-sm">{message}</p>}
            </div>
            {onClose && (
                <button onClick={onClose} className="text-lg leading-none opacity-50 hover:opacity-75">
                    ×
                </button>
            )}
        </div>
    )
}
