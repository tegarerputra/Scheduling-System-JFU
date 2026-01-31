/**
 * Check if the current Google Access Token is valid (not expired).
 * If expired, clears session and returns false (triggering logout).
 */
export function checkTokenValidity() {
    const expiresAt = localStorage.getItem('token_expires_at')

    if (!expiresAt) {
        // If we don't have an expiry time, we assume it's valid for now 
        // (legacy sessions) OR force logout to be safe. 
        // Let's force logout to ensure cleaner state.
        console.warn('No token expiry found. Enforcing logout.')
        clearSession()
        return false
    }

    const now = Date.now()
    // Add a 1-minute buffer (60000ms) to be safe
    if (now > parseInt(expiresAt) - 60000) {
        console.warn('Token expired or about to expire. Logging out.')
        clearSession()
        return false
    }

    return true
}

function clearSession() {
    localStorage.removeItem('user_session')
    localStorage.removeItem('google_credential')
    localStorage.removeItem('token_expires_at')

    // Force reload to clear state and trigger redirect
    window.location.href = '/login'
}
