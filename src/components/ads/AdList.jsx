import React from 'react'
import AdCard from './AdCard'

export default function AdList({ ads, loading, filter, onCancel }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-slate-200 rounded-xl"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (ads.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📭</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">No ads found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    {filter === 'all'
                        ? "You haven't scheduled any ads yet. Start by creating a new ad."
                        : `There are no ${filter} ads at the moment.`
                    }
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} onCancel={onCancel} />
            ))}
        </div>
    )
}
