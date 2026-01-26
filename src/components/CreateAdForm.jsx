import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useAds from '../hooks/useAds'
import { getDefaultPublishTime, calculateTakedownDate, formatDate } from '../lib/dateUtils'

export default function CreateAdForm({ onClose, onSuccess }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            customer_name: '',
            publish_at: getDefaultPublishTime().toISOString().slice(0, 16),
            duration_days: 1,
            description: '',
        }
    })

    const { createAd, loading } = useAds()
    const [submitError, setSubmitError] = useState(null)

    const publishAt = watch('publish_at')
    const durationDays = watch('duration_days')

    const publishDate = publishAt ? new Date(publishAt) : null
    const takedownDate = publishDate && durationDays
        ? calculateTakedownDate(publishDate, parseInt(durationDays))
        : null

    const onSubmit = async (formData) => {
        try {
            setSubmitError(null)

            const publishDateTime = new Date(formData.publish_at)
            const takedownDateTime = calculateTakedownDate(publishDateTime, parseInt(formData.duration_days))

            const adData = {
                title: formData.title,
                customer_name: formData.customer_name,
                description: formData.description || null,
                publish_at: publishDateTime.toISOString(),
                takedown_at: takedownDateTime.toISOString(),
                duration_days: parseInt(formData.duration_days),
            }

            const result = await createAd(adData)

            if (result.success) {
                onSuccess?.()
                onClose?.()
            } else {
                setSubmitError(result.error || 'Failed to create ad')
            }
        } catch (err) {
            setSubmitError(err.message || 'An error occurred')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Ad</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Judul Iklan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Judul Iklan *
                            </label>
                            <input
                                type="text"
                                {...register('title', { required: 'Judul iklan wajib diisi' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Contoh: Promo Akhir Tahun"
                            />
                            {errors.title && (
                                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Customer Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Customer *
                            </label>
                            <input
                                type="text"
                                {...register('customer_name', { required: 'Nama customer wajib diisi' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Contoh: PT ABC Indonesia"
                            />
                            {errors.customer_name && (
                                <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
                            )}
                        </div>

                        {/* Publish Date & Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal & Jam Publish *
                            </label>
                            <input
                                type="datetime-local"
                                {...register('publish_at', { required: 'Tanggal publish wajib diisi' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.publish_at && (
                                <p className="text-red-600 text-sm mt-1">{errors.publish_at.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Default: Besok jam 15:00 WIB</p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Durasi (hari) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                {...register('duration_days', {
                                    required: 'Durasi wajib diisi',
                                    min: { value: 1, message: 'Durasi minimal 1 hari' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.duration_days && (
                                <p className="text-red-600 text-sm mt-1">{errors.duration_days.message}</p>
                            )}
                            {takedownDate && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Takedown: {formatDate(takedownDate)}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi (Optional)
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Catatan tambahan tentang iklan ini..."
                            />
                        </div>

                        {/* Error Message */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 text-sm">{submitError}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Ad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
