import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { ad_id, title, customer_name, publish_at, takedown_at } = await req.json()

        // Get environment variables
        const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
        const serviceAccountKey = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}')
        const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID')

        if (!serviceAccountEmail || !serviceAccountKey.private_key || !calendarId) {
            throw new Error('Missing required environment variables')
        }

        // Create JWT for Google API authentication
        const now = Math.floor(Date.now() / 1000)
        const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
        const jwtClaim = btoa(JSON.stringify({
            iss: serviceAccountEmail,
            scope: 'https://www.googleapis.com/auth/calendar',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now,
        }))

        // Sign JWT (simplified - in production use proper crypto library)
        const jwtSignature = await signJWT(jwtHeader, jwtClaim, serviceAccountKey.private_key)
        const jwt = `${jwtHeader}.${jwtClaim}.${jwtSignature}`

        // Exchange JWT for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        })

        const { access_token } = await tokenResponse.json()

        if (!access_token) {
            throw new Error('Failed to get access token')
        }

        // Calculate publish reminder time (1 hour before)
        const publishDate = new Date(publish_at)
        const publishReminder = new Date(publishDate.getTime() - 60 * 60 * 1000)

        // Create publish reminder event
        const publishEvent = {
            summary: `🔔 Publish: ${title}`,
            description: `Reminder to publish ad for ${customer_name}\n\nAd will be published at ${publishDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
            start: {
                dateTime: publishReminder.toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            end: {
                dateTime: new Date(publishReminder.getTime() + 15 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            colorId: '9', // Blue
        }

        const publishEventResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(publishEvent),
            }
        )

        const publishEventData = await publishEventResponse.json()

        // Create takedown event
        const takedownDate = new Date(takedown_at)
        const takedownEvent = {
            summary: `🔻 Takedown: ${title}`,
            description: `Reminder to takedown ad for ${customer_name}\n\nAd should be taken down at ${takedownDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
            start: {
                dateTime: takedownDate.toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            end: {
                dateTime: new Date(takedownDate.getTime() + 15 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Jakarta',
            },
            colorId: '11', // Red
        }

        const takedownEventResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(takedownEvent),
            }
        )

        const takedownEventData = await takedownEventResponse.json()

        // Update ad with event IDs
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        await supabaseClient
            .from('ads')
            .update({
                publish_event_id: publishEventData.id,
                takedown_event_id: takedownEventData.id,
            })
            .eq('id', ad_id)

        return new Response(
            JSON.stringify({
                success: true,
                publish_event_id: publishEventData.id,
                takedown_event_id: takedownEventData.id,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})

// Helper function to sign JWT (simplified)
async function signJWT(header: string, claim: string, privateKey: string): Promise<string> {
    // In production, use proper RSA signing
    // This is a placeholder - you'll need to implement proper JWT signing
    // or use a library like https://deno.land/x/djwt
    return 'signature-placeholder'
}
