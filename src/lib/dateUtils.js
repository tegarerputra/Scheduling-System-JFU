import { format, parseISO, addDays, subHours } from 'date-fns'

// Timezone constant
export const TIMEZONE = 'Asia/Jakarta'

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy, HH:mm')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'dd MMM yyyy, HH:mm') {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
}

/**
 * Calculate takedown date based on publish date and duration
 * @param {Date} publishDate - Publish date
 * @param {number} durationDays - Duration in days
 * @returns {Date} Takedown date
 */
export function calculateTakedownDate(publishDate, durationDays) {
    return addDays(publishDate, durationDays)
}

/**
 * Get default publish time (today at 15:00 WIB)
 * @returns {Date} Default publish date
 */
export function getDefaultPublishTime() {
    const today = new Date()
    today.setHours(15, 0, 0, 0)

    // Adjust for timezone offset to get correct local time string
    const offset = today.getTimezoneOffset() * 60000 // offset in milliseconds
    const localTime = new Date(today.getTime() - offset)

    return localTime
}

/**
 * Format date for Google Calendar API (ISO 8601 with timezone)
 * @param {Date} date - Date to format
 * @returns {string} ISO string with timezone
 */
export function formatForGoogleCalendar(date) {
    // Format: 2026-01-23T15:00:00+07:00
    const isoString = date.toISOString()
    return isoString.replace('Z', '+07:00')
}

/**
 * Get publish event time (1 hour before actual publish time)
 * @param {Date} publishDate - Actual publish date
 * @returns {Date} Event start time
 */
export function getPublishEventTime(publishDate) {
    return subHours(publishDate, 1)
}

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPast(date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj < new Date()
}

/**
 * Get date only (without time) for comparison
 * @param {Date|string} date - Date to process
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getDateOnly(date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'yyyy-MM-dd')
}
