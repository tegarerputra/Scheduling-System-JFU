import React from 'react'
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Banknote, Palette, AlertTriangle, Link as LinkIcon, Edit, User } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDate } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'

export default function AdCard({ ad, onCancel, onEdit, onSchedule }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Draft</Badge>
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
            <CardContent className="p-5">
                {/* Header: Title & Status */}
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-base">{ad.title}</h3>
                        {getTypeBadge(ad.ad_type)}
                    </div>
                    {getStatusBadge(ad.status)}
                </div>

                {/* Metadata Row: Customer • Date • Sync */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5" />
                        {ad.customer_name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(ad.publish_at)} - {formatDate(ad.takedown_at)}
                    </span>
                    {ad.publish_event_id && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                            </span>
                        </>
                    )}
                </div>

                {/* Content Grid */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <div className="flex flex-col gap-2">
                        {/* Incentive & Color Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Banknote className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{ad.incentive_details || '-'}</span>
                                {ad.incentive_type && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 uppercase tracking-wide text-slate-500">
                                        {ad.incentive_type}
                                    </span>
                                )}
                            </div>
                            {ad.background_color && (
                                <div className="flex items-center gap-2" title="Background Color">
                                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                                    <span
                                        className="w-5 h-5 rounded-full border border-slate-200 shadow-sm"
                                        style={{ backgroundColor: ad.background_color }}
                                    ></span>
                                </div>
                            )}
                        </div>

                        {/* Survey Link Row */}
                        {!ad.survey_link ? (
                            (ad.status === 'scheduled' || ad.status === 'draft') && (
                                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50/50 p-1.5 rounded border border-amber-100/50">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Missing Survey Link
                                </div>
                            )
                        ) : (
                            <a
                                href={ad.survey_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors mt-1"
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                                {ad.survey_link}
                            </a>
                        )}
                    </div>
                </div>

                {/* Notes (if any) */}
                {ad.description && (
                    <p className="text-xs text-slate-500 italic mb-4 line-clamp-2 pl-2 border-l-2 border-slate-100">
                        "{ad.description}"
                    </p>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 border-dashed">
                    {ad.status === 'draft' && (() => {
                        const isBriefComplete = ad.title && ad.customer_name && ad.incentive_details && ad.survey_link
                        return (
                            <Button
                                size="sm"
                                className={cn(
                                    "h-8 text-xs font-medium transition-all",
                                    isBriefComplete
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-emerald-200"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                                disabled={!isBriefComplete}
                                onClick={() => onSchedule(ad.id)}
                                title={!isBriefComplete ? "Complete the brief (Survey Link) to schedule" : "Schedule to Calendar"}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                {isBriefComplete ? "Schedule Ad" : "Incomplete Brief"}
                            </Button>
                        )
                    })()}

                    {(ad.status === 'scheduled' || ad.status === 'draft' || ad.status === 'live') && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                                onClick={() => onEdit(ad)}
                            >
                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
                                onClick={() => onCancel(ad.id, ad.title)}
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
