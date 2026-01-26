export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const SHARED_CALENDAR_ID = import.meta.env.VITE_SHARED_CALENDAR_ID

if (!GOOGLE_CLIENT_ID) {
    console.warn('Missing VITE_GOOGLE_CLIENT_ID environment variable')
}

if (!SHARED_CALENDAR_ID) {
    console.warn('Missing VITE_SHARED_CALENDAR_ID environment variable')
}

// Google OAuth scopes required for the application
export const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.events',
].join(' ')
