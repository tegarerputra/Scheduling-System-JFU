import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { createCalendarEvents, deleteCalendarEvents } from '../lib/calendarApi'
import { SHARED_CALENDAR_ID } from '../lib/googleAuth'

export default function useAds() {
    const { ads, setAds, addAd, updateAd, removeAd, user } = useStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch all ads
    const fetchAds = async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('ads')
                .select('*')
                .order('publish_at', { ascending: true })

            if (error) throw error
            setAds(data || [])
        } catch (err) {
            console.error('Error fetching ads:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Create new ad
    const createAd = async (adData) => {
        if (!user?.id) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('ads')
                .insert({
                    ...adData,
                    created_by: user.id,
                    ad_type: 'new',
                })
                .select()
                .single()

            if (error) throw error

            // Create calendar events if user has access token
            if (user.google_access_token && SHARED_CALENDAR_ID) {
                try {
                    const calendarResult = await createCalendarEvents(
                        user.google_access_token,
                        SHARED_CALENDAR_ID,
                        {
                            title: data.title,
                            customer_name: data.customer_name,
                            publish_at: data.publish_at,
                            takedown_at: data.takedown_at,
                        }
                    )

                    if (calendarResult.success) {
                        // Update ad with calendar event IDs
                        await supabase
                            .from('ads')
                            .update({
                                publish_event_id: calendarResult.publish_event_id,
                                takedown_event_id: calendarResult.takedown_event_id,
                            })
                            .eq('id', data.id)

                        data.publish_event_id = calendarResult.publish_event_id
                        data.takedown_event_id = calendarResult.takedown_event_id
                    } else {
                        console.warn('Failed to create calendar events:', calendarResult.error)
                    }
                } catch (calErr) {
                    console.warn('Calendar integration error:', calErr)
                    // Don't fail the whole operation if calendar fails
                }
            }

            addAd(data)
            await fetchAds() // Refresh list
            return { success: true, data }
        } catch (err) {
            console.error('Error creating ad:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    // Extend existing ad
    const extendAd = async (originalAdId, extensionData) => {
        if (!user?.id) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('ads')
                .insert({
                    ...extensionData,
                    created_by: user.id,
                    ad_type: 'extended',
                    original_ad_id: originalAdId,
                })
                .select()
                .single()

            if (error) throw error

            // Create calendar events for extended ad
            if (user.google_access_token && SHARED_CALENDAR_ID) {
                try {
                    const calendarResult = await createCalendarEvents(
                        user.google_access_token,
                        SHARED_CALENDAR_ID,
                        {
                            title: data.title,
                            customer_name: data.customer_name,
                            publish_at: data.publish_at,
                            takedown_at: data.takedown_at,
                        }
                    )

                    if (calendarResult.success) {
                        await supabase
                            .from('ads')
                            .update({
                                publish_event_id: calendarResult.publish_event_id,
                                takedown_event_id: calendarResult.takedown_event_id,
                            })
                            .eq('id', data.id)

                        data.publish_event_id = calendarResult.publish_event_id
                        data.takedown_event_id = calendarResult.takedown_event_id
                    }
                } catch (calErr) {
                    console.warn('Calendar integration error:', calErr)
                }
            }

            addAd(data)
            await fetchAds() // Refresh list
            return { success: true, data }
        } catch (err) {
            console.error('Error extending ad:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    // Cancel ad
    const cancelAd = async (adId) => {
        if (!user?.id) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            setLoading(true)
            setError(null)

            // Get ad data first to get event IDs
            const { data: adData } = await supabase
                .from('ads')
                .select('*')
                .eq('id', adId)
                .single()

            const { data, error } = await supabase
                .from('ads')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancelled_by: user.id,
                })
                .eq('id', adId)
                .select()
                .single()

            if (error) throw error

            // Delete calendar events if they exist
            if (user.google_access_token && SHARED_CALENDAR_ID && adData) {
                if (adData.publish_event_id || adData.takedown_event_id) {
                    try {
                        await deleteCalendarEvents(
                            user.google_access_token,
                            SHARED_CALENDAR_ID,
                            adData.publish_event_id,
                            adData.takedown_event_id
                        )
                    } catch (calErr) {
                        console.warn('Failed to delete calendar events:', calErr)
                    }
                }
            }

            updateAd(adId, data)
            await fetchAds() // Refresh list
            return { success: true, data }
        } catch (err) {
            console.error('Error cancelling ad:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    // Fetch ads on mount and setup realtime subscription
    useEffect(() => {
        if (user?.id) {
            fetchAds()

            // Subscribe to realtime changes
            const channel = supabase
                .channel('ads-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                        schema: 'public',
                        table: 'ads',
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            addAd(payload.new)
                        } else if (payload.eventType === 'UPDATE') {
                            updateAd(payload.new.id, payload.new)
                        } else if (payload.eventType === 'DELETE') {
                            removeAd(payload.old.id)
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'CHANNEL_ERROR') {
                        console.error('Realtime subscription error')
                    } else if (status === 'TIMED_OUT') {
                        console.error('Realtime subscription timed out')
                    }
                })

            // Cleanup subscription on unmount
            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user?.id])

    return {
        ads,
        loading,
        error,
        fetchAds,
        createAd,
        extendAd,
        cancelAd,
    }
}
