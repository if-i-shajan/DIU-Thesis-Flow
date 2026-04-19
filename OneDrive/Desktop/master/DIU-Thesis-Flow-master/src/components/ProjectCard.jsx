import React from 'react'
import { PlayCircle, User, BookOpen } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'

export const ProjectCard = ({ project, onViewDetails, onSelectSupervisor }) => {
    const getYoutubeEmbedUrl = (url) => {
        const videoId = url?.includes('youtube.com')
            ? new URLSearchParams(new URL(url).search).get('v')
            : url?.split('/').pop()
        return `https://www.youtube.com/embed/${videoId}`
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            {/* Video Thumbnail */}
            {project.video_link && (
                <div className="mb-4 -mx-6 -mt-6 h-48 bg-gray-900 rounded-t-xl overflow-hidden relative group">
                    <iframe
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(project.video_link)}
                        title={project.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{project.title}</h3>
                        <Badge variant={project.status || 'info'}>{project.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>

                {/* Supervisor Info */}
                {project.supervisors && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Supervisor</p>
                            <p className="font-semibold text-gray-900">{project.supervisors.full_name}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onViewDetails?.(project.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                        View Details
                    </button>
                    {onSelectSupervisor && (
                        <button
                            onClick={() => onSelectSupervisor?.(project.id)}
                            className="flex-1 px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                        >
                            Select
                        </button>
                    )}
                </div>
            </div>
        </Card>
    )
}
