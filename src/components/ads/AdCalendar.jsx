import React from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export default function AdCalendar({ ads, currentDate = new Date(), onDateChange, onDateSelect }) {
    const [viewDate, setViewDate] = React.useState(currentDate)

    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    // Group ads by date (spanning duration)
    const adsByDate = ads.reduce((acc, ad) => {
        const startDate = new Date(ad.publish_at)
        const duration = parseInt(ad.duration_days) || 1

        for (let i = 0; i < duration; i++) {
            const currentDate = addDays(startDate, i)
            const dateKey = format(currentDate, 'yyyy-MM-dd')

            if (!acc[dateKey]) acc[dateKey] = []
            acc[dateKey].push(ad)
        }
        return acc
    }, {})

    const nextMonth = () => {
        setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))
    }

    const prevMonth = () => {
        setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">
                    {format(viewDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setViewDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 divide-y">
                {calendarDays.map((day, dayIdx) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const daysAds = adsByDate[dateKey] || []
                    const isActiveMonth = isSameMonth(day, monthStart)
                    const isCurrentDay = isToday(day)

                    // Slot logic simulation (3 new, 1 extended)
                    const newAdsCount = daysAds.filter(a => a.ad_type === 'new').length
                    const extAdsCount = daysAds.filter(a => a.ad_type !== 'new').length
                    const isFull = newAdsCount >= 3 && extAdsCount >= 1

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateSelect && onDateSelect(day)}
                            className={cn(
                                "min-h-[100px] p-2 transition-colors cursor-pointer hover:bg-slate-50",
                                !isActiveMonth && "bg-slate-50/50",
                                isCurrentDay && "bg-blue-50/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    isCurrentDay
                                        ? "bg-blue-600 text-white"
                                        : isActiveMonth ? "text-slate-700" : "text-slate-400"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {daysAds.length > 0 && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                                        isFull
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : "bg-green-50 text-green-700 border-green-100"
                                    )}>
                                        {daysAds.length}/4
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {daysAds.slice(0, 3).map((ad) => (
                                    <div
                                        key={ad.id}
                                        className={cn(
                                            "text-[10px] truncate px-1.5 py-0.5 rounded border",
                                            ad.status === 'scheduled' ? "bg-amber-50 border-amber-100 text-amber-700" :
                                                ad.status === 'live' ? "bg-green-50 border-green-100 text-green-700" :
                                                    "bg-slate-50 border-slate-100 text-slate-600"
                                        )}
                                        title={ad.title}
                                    >
                                        {ad.title}
                                    </div>
                                ))}
                                {daysAds.length > 3 && (
                                    <div className="text-[10px] text-slate-400 pl-1">
                                        +{daysAds.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
