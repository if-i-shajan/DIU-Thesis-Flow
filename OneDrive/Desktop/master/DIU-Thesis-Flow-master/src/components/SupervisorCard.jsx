import React from 'react'
import { Mail, MapPin, Award } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'

export const SupervisorCard = ({ supervisor, onRequest, onViewDetails }) => {
    return (
        <Card className="flex flex-col">
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">{supervisor.user_profiles?.full_name}</h3>
                <Badge variant="secondary">{supervisor.department}</Badge>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 mb-4">
                <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-600">Research Area</p>
                        <p className="font-semibold text-gray-900">{supervisor.research_area}</p>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-600">Experience</p>
                        <p className="font-semibold text-gray-900">{supervisor.years_of_experience} years</p>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <a
                            href={`mailto:${supervisor.user_profiles?.email}`}
                            className="font-semibold text-blue-600 hover:text-blue-700 break-all"
                        >
                            {supervisor.user_profiles?.email}
                        </a>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onViewDetails && (
                    <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => onViewDetails(supervisor.id)}
                    >
                        View Profile
                    </Button>
                )}
                {onRequest && (
                    <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => onRequest(supervisor.id)}
                    >
                        Send Request
                    </Button>
                )}
            </div>
        </Card>
    )
}
