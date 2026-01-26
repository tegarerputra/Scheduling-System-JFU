// Google Calendar API helper functions

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

/**
 * Create calendar events for an ad (publish reminder + takedown reminder)
 */
export async function createCalendarEvents(accessToken, calendarId, adData) {
    try {
        const { title, customer_name, publish_at, takedown_at } = adData

        // Calculate publish reminder time (1 hour before)
        const publishDate = new Date(publish_at)
        const publishReminder = new Date(publishDate.getTime() - 60 * 60 * 1000)

        // Create publish reminder event (1 hour before, duration 1 hour)
        const publishEvent = {
            summary: `🔔 Publish: ${title}`,
            description: `Reminder to publish ad for ${customer_name}\n\nAd will be published at ${publishDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
            start: {
                dateTime: publishReminder.toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            end: {
                dateTime: publishDate.toISOString(), // Event ends at publish time (1 hour duration)
                timeZone: 'Asia/Jakarta',
            },
            colorId: '9', // Blue
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 5 },
                ],
            },
        }

        const publishResponse = await fetch(
            `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(publishEvent),
            }
        )

        if (!publishResponse.ok) {
            const error = await publishResponse.json()
            throw new Error(error.error?.message || 'Failed to create publish event')
        }

        const publishEventData = await publishResponse.json()

        // Create takedown event (30 minutes duration)
        const takedownDate = new Date(takedown_at)
        const takedownEnd = new Date(takedownDate.getTime() + 30 * 60 * 1000) // 30 minutes

        const takedownEvent = {
            summary: `🔻 Takedown: ${title}`,
            description: `Reminder to takedown ad for ${customer_name}\n\nAd should be taken down at ${takedownDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
            start: {
                dateTime: takedownDate.toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            end: {
                dateTime: takedownEnd.toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            colorId: '11', // Red
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 5 },
                ],
            },
        }

        const takedownResponse = await fetch(
            `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(takedownEvent),
            }
        )

        if (!takedownResponse.ok) {
            const error = await takedownResponse.json()
            throw new Error(error.error?.message || 'Failed to create takedown event')
        }

        const takedownEventData = await takedownResponse.json()

        return {
            success: true,
            publish_event_id: publishEventData.id,
            takedown_event_id: takedownEventData.id,
        }
    } catch (error) {
        console.error('Error creating calendar events:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Delete calendar events
 */
export async function deleteCalendarEvents(accessToken, calendarId, publishEventId, takedownEventId) {
    try {
        const deletePromises = []

        if (publishEventId) {
            deletePromises.push(
                fetch(
                    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${publishEventId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    }
                )
            )
        }

        if (takedownEventId) {
            deletePromises.push(
                fetch(
                    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${takedownEventId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    }
                )
            )
        }

        await Promise.all(deletePromises)

        return { success: true }
    } catch (error) {
        console.error('Error deleting calendar events:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Update calendar events (delete old, create new)
 */
export async function updateCalendarEvents(accessToken, calendarId, oldEventIds, newAdData) {
    try {
        // Delete old events
        if (oldEventIds.publish_event_id || oldEventIds.takedown_event_id) {
            await deleteCalendarEvents(
                accessToken,
                calendarId,
                oldEventIds.publish_event_id,
                oldEventIds.takedown_event_id
            )
        }

        // Create new events
        const result = await createCalendarEvents(accessToken, calendarId, newAdData)
        return result
    } catch (error) {
        console.error('Error updating calendar events:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}
