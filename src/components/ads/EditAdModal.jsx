import React from 'react'
import { X, Type, User, Banknote, Link, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { getDefaultPublishTime, calculateTakedownDate, formatDate } from '../../lib/dateUtils'

export default function EditAdModal({ isOpen, onClose, onSubmit, ad, loading }) {
    const [formData, setFormData] = React.useState({
        title: '',
        customer_name: '',
        publish_at: '',
        duration_days: 1,
        incentive_nominal: '',
        incentive_winners: '',
        survey_link: '',
        description: '',
    })

    React.useEffect(() => {
        if (ad) {
            // Parse incentive details if available
            let nominal = ''
            let winners = ''

            if (ad.incentive_details && ad.incentive_details.includes('x')) {
                // Robust parsing: split by 'x' (case insensitive)
                const parts = ad.incentive_details.toLowerCase().split('x')
                if (parts.length >= 2) {
                    // Part 1: Nominal (remove all non-digits)
                    nominal = parts[0].replace(/\D/g, '')
                    // Part 2: Winners (extract first number)
                    const winnersMatch = parts[1].match(/\d+/)
                    if (winnersMatch) {
                        winners = winnersMatch[0]
                    }
                }
            }

            setFormData({
                title: ad.title || '',
                customer_name: ad.customer_name || '',
                publish_at: ad.publish_at ? formatDate(ad.publish_at, "yyyy-MM-dd'T'HH:mm") : '',
                duration_days: ad.duration_days || 1,
                incentive_nominal: nominal,
                incentive_winners: winners,
                survey_link: ad.survey_link || '',
                description: ad.description || '',
            })
        }
    }, [ad, isOpen])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Format incentive string
        const nominal = parseInt(formData.incentive_nominal.replace(/\D/g, '')) || 0
        const winners = parseInt(formData.incentive_winners) || 0
        const total = nominal * winners

        const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

        const incentiveString = `${formatIDR(nominal)} x ${winners} Pemenang (Total: ${formatIDR(total)})`

        // Calculate takedown if date changed
        let publishDateTime, takedownDateTime
        if (formData.publish_at) {
            publishDateTime = new Date(formData.publish_at)
            takedownDateTime = calculateTakedownDate(publishDateTime, parseInt(formData.duration_days))
        }

        const payload = {
            ...formData,
            incentive_details: incentiveString,
            duration_days: parseInt(formData.duration_days),
            ...(publishDateTime && {
                publish_at: publishDateTime.toISOString(),
                takedown_at: takedownDateTime.toISOString()
            })
        }

        // Remove temp fields
        delete payload.incentive_nominal
        delete payload.incentive_winners

        onSubmit(ad.id, payload)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Update Ad Brief</h2>
                        <p className="text-sm text-slate-500">Edit details for {ad?.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Ad Information</label>
                            <div className="grid gap-3">
                                <div className="relative">
                                    <Type className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ad Title"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Customer Name"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                Schedule
                                {ad?.status !== 'draft' && <span className="text-xs text-amber-600 ml-2 font-normal">(Locked)</span>}
                            </label>
                            <div className="grid gap-3">
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="datetime-local"
                                        name="publish_at"
                                        value={formData.publish_at}
                                        onChange={handleInputChange}
                                        disabled={ad?.status !== 'draft'}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            name="duration_days"
                                            value={formData.duration_days}
                                            onChange={handleInputChange}
                                            min="1"
                                            disabled={ad?.status !== 'draft'}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">Days</span>
                                    </div>
                                    {formData.publish_at && (
                                        <div className="flex-1 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                            End: <span className="font-medium text-slate-700">
                                                {formatDate(calculateTakedownDate(new Date(formData.publish_at), parseInt(formData.duration_days)))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Brief Details</label>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            name="incentive_nominal"
                                            value={formData.incentive_nominal}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nominal (e.g. 50000)"
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            name="incentive_winners"
                                            value={formData.incentive_winners}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Winners (e.g. 5)"
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                {formData.incentive_nominal && formData.incentive_winners && (
                                    <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 flex justify-between">
                                        <span>Total Budget:</span>
                                        <span className="font-semibold text-slate-700">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                                                (parseInt(formData.incentive_nominal) || 0) * (parseInt(formData.incentive_winners) || 0)
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="relative">
                                    <Link className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        name="survey_link"
                                        value={formData.survey_link}
                                        onChange={handleInputChange}
                                        placeholder="Survey Link"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
