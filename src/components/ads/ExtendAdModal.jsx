import React from 'react'
import { X, Calendar as CalendarIcon, Clock, Link as LinkIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { getDefaultPublishTime, calculateTakedownDate, formatDate } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'

export default function ExtendAdModal({ isOpen, onClose, onSubmit, checkAvailability, slotInfo, checkingSlots, loading, ads }) {
    const [formData, setFormData] = React.useState({
        original_ad_id: '',
        publish_at: getDefaultPublishTime().toISOString().slice(0, 16),
        duration_days: 1,
        note: '',
    })

    const extendableAds = ads.filter(ad => ad.status !== 'cancelled' && ad.ad_type === 'new')

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                original_ad_id: '',
                publish_at: getDefaultPublishTime().toISOString().slice(0, 16),
                duration_days: 1,
                note: '',
            })
            checkAvailability(new Date(getDefaultPublishTime()), 'extended')
        }
    }, [isOpen])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'publish_at' && value) {
            checkAvailability(new Date(value), 'extended')
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    if (!isOpen) return null

    const extendTakedownDate = formData.publish_at && formData.duration_days
        ? calculateTakedownDate(new Date(formData.publish_at), parseInt(formData.duration_days))
        : null

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Extend Ad</h2>
                        <p className="text-sm text-slate-500">Extend an existing advertisement</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Select Ad to Extend</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <select
                                name="original_ad_id"
                                value={formData.original_ad_id}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none bg-white"
                            >
                                <option value="">-- Select Ad --</option>
                                {extendableAds.map(ad => (
                                    <option key={ad.id} value={ad.id}>
                                        {ad.title} - {ad.customer_name} ({ad.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Only active new ads can be extended.</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">New Schedule</label>
                        <div className="grid gap-3">
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    name="publish_at"
                                    value={formData.publish_at}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            </div>

                            {/* Slot Status Indicator */}
                            {formData.publish_at && (
                                <div className={cn(
                                    "text-xs px-3 py-2 rounded-md border flex items-center justify-between",
                                    checkingSlots ? "bg-slate-50 border-slate-100 text-slate-500" :
                                        slotInfo?.available
                                            ? "bg-green-50 border-green-100 text-green-700"
                                            : "bg-red-50 border-red-100 text-red-700"
                                )}>
                                    <span className="font-medium">
                                        {checkingSlots ? "Checking slots..." : slotInfo?.message || "Checking status..."}
                                    </span>
                                    {!checkingSlots && slotInfo && (
                                        <span>{slotInfo.extended_slots_used}/1 Extended Used</span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        name="duration_days"
                                        value={formData.duration_days}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">Days</span>
                                </div>
                                {extendTakedownDate && (
                                    <div className="flex-1 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                        Until: <span className="font-medium text-slate-700">{formatDate(extendTakedownDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Extension Note</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                            placeholder="Reason for extension..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading || checkingSlots || (slotInfo && !slotInfo.available)}
                        >
                            {loading ? 'Extending...' : 'Extend Ad'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
