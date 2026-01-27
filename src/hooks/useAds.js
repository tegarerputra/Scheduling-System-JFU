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
                .order('publish_at', { ascending: false })

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

            // 1. Get last ad for auto-brief rotation
            const { data: lastAd } = await supabase
                .from('ads')
                .select('incentive_type, background_color')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            // 2. Determine Incentive Type (Flip-Flop)
            let nextIncentiveType = 'gopay'
            if (lastAd?.incentive_type === 'gopay') {
                nextIncentiveType = 'dana'
            }

            // 3. Determine Background Color (Random but distinct)
            const palette = [
                '#F87171', // Red 400
                '#FB923C', // Orange 400
                '#FACC15', // Yellow 400
                '#4ADE80', // Green 400
                '#2DD4BF', // Teal 400
                '#60A5FA', // Blue 400
                '#818CF8', // Indigo 400
                '#A78BFA', // Violet 400
                '#F472B6', // Pink 400
                '#FB7185'  // Rose 400
            ]

            let nextColor = palette[Math.floor(Math.random() * palette.length)]
            // specific check to avoid same color twice in a row
            if (lastAd?.background_color === nextColor) {
                const filteredUserByPalette = palette.filter(c => c !== nextColor)
                nextColor = filteredUserByPalette[Math.floor(Math.random() * filteredUserByPalette.length)]
            }

            const insertPayload = {
                ...adData,
                created_by: user.id,
                ad_type: 'new',
                incentive_type: nextIncentiveType,
                background_color: nextColor,
                status: 'draft' // Initial status is ALWAYS draft
            }

            const { data, error } = await supabase
                .from('ads')
                .insert(insertPayload)
                .select()
                .single()

            if (error) throw error

            // Note: We DO NOT create calendar events here anymore.
            // That happens in scheduleAd()

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

    // Schedule Draft Ad (Approve & Sync to Calendar)
    const scheduleAd = async (adId) => {
        if (!user?.id) return { success: false, error: 'User not authenticated' }

        try {
            setLoading(true)
            const { data: adData } = await supabase.from('ads').select('*').eq('id', adId).single()
            if (!adData) throw new Error('Ad not found')

            if (user.google_access_token && SHARED_CALENDAR_ID) {
                const calendarResult = await createCalendarEvents(
                    user.google_access_token,
                    SHARED_CALENDAR_ID,
                    {
                        title: adData.title,
                        customer_name: adData.customer_name,
                        publish_at: adData.publish_at,
                        takedown_at: adData.takedown_at,
                    }
                )

                if (calendarResult.success) {
                    await supabase
                        .from('ads')
                        .update({
                            status: 'scheduled',
                            publish_event_id: calendarResult.publish_event_id,
                            takedown_event_id: calendarResult.takedown_event_id,
                        })
                        .eq('id', adId)

                    // Optimistic update
                    updateAd(adId, {
                        status: 'scheduled',
                        publish_event_id: calendarResult.publish_event_id,
                        takedown_event_id: calendarResult.takedown_event_id
                    })

                    return { success: true }
                } else {
                    throw new Error('Failed to create calendar events: ' + calendarResult.error)
                }
            } else {
                throw new Error('Google Calendar not connected')
            }
        } catch (err) {
            console.error('Error scheduling ad:', err)
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
                    status: 'draft' // Extended ads also start as draft
                })
                .select()
                .single()

            if (error) throw error

            // Note: Calendar events are created in scheduleAd()
            // We removed the auto-sync here.

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

    // Update ad details (brief info)
    const updateAdDetails = async (adId, updates) => {
        if (!user?.id) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('ads')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', adId)
                .select()
                .single()

            if (error) throw error

            updateAd(adId, data)
            return { success: true, data }
        } catch (err) {
            console.error('Error updating ad:', err)
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
        updateAdDetails,
        scheduleAd,
    }
}
