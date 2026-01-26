import { create } from 'zustand'

const useStore = create((set) => ({
    // User state
    user: (() => {
        try {
            // Try to restore full user session first (contains Supabase ID)
            const session = localStorage.getItem('user_session')
            if (session) {
                return JSON.parse(session)
            }

            // Fallback to basic credential (no ID, will need fetch)
            const credential = localStorage.getItem('google_credential')
            if (credential) {
                const payload = JSON.parse(atob(credential.split('.')[1]))
                return {
                    email: payload.email,
                    name: payload.name,
                    avatar_url: payload.picture,
                    google_access_token: credential
                }
            }
        } catch (e) {
            console.error('Failed to restore session:', e)
            localStorage.removeItem('user_session')
            localStorage.removeItem('google_credential')
        }
        return null
    })(),
    setUser: (user) => set({ user }),

    // Ads state
    ads: [],
    setAds: (ads) => set({ ads }),
    addAd: (ad) => set((state) => ({ ads: [...state.ads, ad] })),
    updateAd: (id, updates) => set((state) => ({
        ads: state.ads.map((ad) => (ad.id === id ? { ...ad, ...updates } : ad))
    })),
    removeAd: (id) => set((state) => ({
        ads: state.ads.filter((ad) => ad.id !== id)
    })),

    // Loading state
    loading: false,
    setLoading: (loading) => set({ loading }),

    // Error state
    error: null,
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}))

export default useStore
