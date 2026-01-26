import React from 'react'
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDate } from '../../lib/dateUtils'

export default function AdCard({ ad, onCancel }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Scheduled</Badge>
            case 'live':
                return <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Live</Badge>
            case 'completed':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-800">Completed</Badge>
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTypeBadge = (type) => {
        return type === 'new'
            ? <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">New Ad</Badge>
            : <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">Extended</Badge>
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-200 group border-slate-200/60">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-semibold text-slate-900 truncate pr-2">{ad.title}</h3>
                            <div className="flex gap-1 shrink-0">
                                {getTypeBadge(ad.ad_type)}
                                {ad.publish_event_id && (
                                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 gap-1 pl-1.5">
                                        <Calendar className="w-3 h-3" /> Synced
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {ad.customer_name}
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Publish: <span className="text-slate-700 font-medium">{formatDate(ad.publish_at)}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>End: <span className="text-slate-700 font-medium">{formatDate(ad.takedown_at)}</span></span>
                            </div>
                        </div>

                        {ad.description && (
                            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 italic">
                                "{ad.description}"
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3 pl-4 border-l border-slate-100 ml-4">
                        {getStatusBadge(ad.status)}

                        {ad.status === 'scheduled' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs font-medium w-full"
                                onClick={() => onCancel(ad.id, ad.title)}
                            >
                                Cancel Ad
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
