import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getDateOnly } from '../lib/dateUtils'

export default function useSlotValidation(date, adType = 'new') {
    const [slotInfo, setSlotInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!date) {
            setSlotInfo(null)
            return
        }

        const checkSlots = async () => {
            try {
                setLoading(true)
                const dateStr = getDateOnly(date)

                const { data, error } = await supabase
                    .rpc('check_slot_availability', {
                        p_date: dateStr,
                        p_ad_type: adType,
                    })

                if (error) throw error
                setSlotInfo(data)
            } catch (err) {
                console.error('Error checking slot availability:', err)
                setSlotInfo({
                    available: false,
                    message: 'Error checking slot availability',
                })
            } finally {
                setLoading(false)
            }
        }

        checkSlots()
    }, [date, adType])

    return { slotInfo, loading }
}
