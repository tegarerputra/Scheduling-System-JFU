import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Plus, LayoutGrid, Calendar as CalendarIcon, Filter } from 'lucide-react'
import useStore from '../store/useStore'
import useAds from '../hooks/useAds'
import { formatDate, getDefaultPublishTime, calculateTakedownDate, getDateOnly } from '../lib/dateUtils'
import { supabase } from '../lib/supabase'

// Components
import Header from '../components/layout/Header'
import AdList from '../components/ads/AdList'
import AdCalendar from '../components/ads/AdCalendar'
import CreateAdModal from '../components/ads/CreateAdModal'
import ExtendAdModal from '../components/ads/ExtendAdModal'
import EditAdModal from '../components/ads/EditAdModal'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
    const { user } = useStore()
    const { ads, loading, createAd, cancelAd, extendAd, updateAdDetails, scheduleAd } = useAds()

    // View State
    const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
    const [filter, setFilter] = useState('all')
    const [showDebugInfo, setShowDebugInfo] = useState(false)

    // Modal State
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showExtendForm, setShowExtendForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [currentEditingAd, setCurrentEditingAd] = useState(null)

    // Slot Check State
    const [slotInfo, setSlotInfo] = useState(null)
    const [checkingSlots, setCheckingSlots] = useState(false)
    const [lastCheckedDate, setLastCheckedDate] = useState(null)

    const handleLogout = () => {
        localStorage.removeItem('google_credential')
        window.location.href = '/login'
    }

    const checkSlotAvailability = async (date, adType = 'new') => {
        // Debounce or avoid re-checking same date too fast
        const dateStr = getDateOnly(date)
        if (dateStr === lastCheckedDate && slotInfo) return

        try {
            setCheckingSlots(true)

            const { data, error } = await supabase
                .rpc('check_slot_availability', {
                    p_date: dateStr,
                    p_ad_type: adType,
                })

            if (error) throw error
            setSlotInfo(data)
            setLastCheckedDate(dateStr)
        } catch (err) {
            console.error('Error checking slots:', err)
            toast.error('Could not check slot availability')
        } finally {
            setCheckingSlots(false)
        }
    }

    const handleCreateSubmit = async (formData) => {
        if (slotInfo && !slotInfo.available) {
            toast.error('Slot is full for this date. Please choose another date.')
            return
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const publishDateTime = new Date(formData.publish_at)
                const takedownDateTime = calculateTakedownDate(publishDateTime, parseInt(formData.duration_days))

                const adData = {
                    title: formData.title,
                    customer_name: formData.customer_name,
                    description: formData.description || null,
                    publish_at: publishDateTime.toISOString(),
                    takedown_at: takedownDateTime.toISOString(),
                    duration_days: parseInt(formData.duration_days),
                    incentive_details: formData.incentive_details,
                    survey_link: formData.survey_link,
                }

                const result = await createAd(adData)
                if (result.success) {
                    resolve(result)
                } else {
                    reject(new Error(result.error))
                }
            } catch (e) {
                reject(e)
            }
        })

        toast.promise(promise, {
            loading: 'Creating ad...',
            success: () => {
                setShowCreateForm(false)
                setSlotInfo(null)
                return 'Ad created successfully! 🎉'
            },
            error: (err) => `Failed to create ad: ${err.message}`
        })
    }

    const handleExtendSubmit = async (formData) => {
        if (slotInfo && !slotInfo.available) {
            toast.error('Slot is full for this date.')
            return
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const originalAd = ads.find(ad => ad.id === formData.original_ad_id)
                if (!originalAd) throw new Error('Original ad not found')

                const publishDateTime = new Date(formData.publish_at)
                const takedownDateTime = calculateTakedownDate(publishDateTime, parseInt(formData.duration_days))

                const extensionData = {
                    title: originalAd.title + ' (Extended)',
                    customer_name: originalAd.customer_name,
                    description: formData.note
                        ? `Extension of: ${originalAd.title}\n\nNote: ${formData.note}`
                        : `Extension of: ${originalAd.title}`,
                    publish_at: publishDateTime.toISOString(),
                    takedown_at: takedownDateTime.toISOString(),
                    duration_days: parseInt(formData.duration_days),
                }

                const result = await extendAd(formData.original_ad_id, extensionData)
                if (result.success) resolve(result)
                else reject(new Error(result.error))
            } catch (e) {
                reject(e)
            }
        })

        toast.promise(promise, {
            loading: 'Extending ad...',
            success: () => {
                setShowExtendForm(false)
                setSlotInfo(null)
                return 'Ad extended successfully! 🚀'
            },
            error: (err) => `Failed to extend: ${err.message}`
        })
    }

    const handleCancelAd = async (adId, adTitle) => {
        toast.promise(cancelAd(adId), {
            loading: 'Cancelling ad...',
            success: 'Ad cancelled successfully',
            error: 'Failed to cancel ad'
        })
    }

    const handleScheduleAd = async (adId) => {
        toast.promise(scheduleAd(adId), {
            loading: 'Scheduling ad...',
            success: 'Ad scheduled and synced to Calendar!',
            error: 'Failed to schedule ad'
        })
    }

    const handleEditClick = (ad) => {
        setCurrentEditingAd(ad)
        setShowEditForm(true)
    }

    const handleUpdateSubmit = async (adId, formData) => {
        const promise = updateAdDetails(adId, formData)

        toast.promise(promise, {
            loading: 'Updating ad...',
            success: (result) => {
                if (result.success) {
                    setShowEditForm(false)
                    setCurrentEditingAd(null)
                    return 'Ad updated successfully'
                } else {
                    throw new Error(result.error)
                }
            },
            error: (err) => `Failed to update: ${err.message}`
        })
    }

    const filteredAds = ads.filter((ad) => {
        if (filter === 'all') return true
        return ad.status === filter
    })

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <Toaster position="top-center" richColors />

            <Header
                user={user}
                onLogout={handleLogout}
                showDebugInfo={showDebugInfo}
                toggleDebugInfo={() => setShowDebugInfo(!showDebugInfo)}
            />

            {/* Debug Info */}
            {showDebugInfo && (
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs font-mono text-amber-900">
                        <p>User: {user?.email} | Token: {user?.google_access_token ? 'OK' : 'MISSING'}</p>
                    </div>
                </div>
            )}

            <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm w-fit">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="gap-2"
                        >
                            <LayoutGrid className="w-4 h-4" /> List
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            className="gap-2"
                        >
                            <CalendarIcon className="w-4 h-4" /> Calendar
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowExtendForm(true)}
                            variant="secondary"
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
                        >
                            Extend Ad
                        </Button>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm shadow-blue-200"
                        >
                            <Plus className="w-4 h-4" /> Create Ad
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-2 hide-scrollbar">
                            {['all', 'draft', 'scheduled', 'live', 'completed', 'cancelled'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`
                                       px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                       ${filter === f
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
                                   `}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <AdList
                            ads={filteredAds}
                            loading={loading}
                            filter={filter}
                            onCancel={handleCancelAd}
                            onEdit={handleEditClick}
                            onSchedule={handleScheduleAd}
                        />
                    </div>
                ) : (
                    <AdCalendar ads={ads} />
                )}
            </main>

            {/* Modals */}
            <CreateAdModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateSubmit}
                checkAvailability={checkSlotAvailability}
                slotInfo={slotInfo}
                checkingSlots={checkingSlots}
                loading={false} // toast handles loading state visually
            />

            <ExtendAdModal
                isOpen={showExtendForm}
                onClose={() => setShowExtendForm(false)}
                onSubmit={handleExtendSubmit}
                checkAvailability={checkSlotAvailability}
                slotInfo={slotInfo}
                checkingSlots={checkingSlots}
                loading={false}
                ads={ads}
            />

            <EditAdModal
                isOpen={showEditForm}
                onClose={() => {
                    setShowEditForm(false)
                    setCurrentEditingAd(null)
                }}
                onSubmit={handleUpdateSubmit}
                ad={currentEditingAd}
                loading={loading}
            />
        </div>
    )
}
