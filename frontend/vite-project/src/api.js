import axios from "axios"

// Base URL of the backend, without a trailing slash.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "")

// The access token lives here (not in React state) so the interceptors can read it.
let accessToken = null
let onAuthFailure = () => {}
let refreshPromise = null

export const setAccessToken = (token) => { accessToken = token }
export const setAuthFailureHandler = (handler) => { onAuthFailure = handler }

// Exchange the stored refresh token for a new access token.
// Concurrent callers share one in-flight request, so only one refresh happens.
export const refreshAccessToken = () => {
    if (!refreshPromise) {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return Promise.reject(new Error("No refresh token"))
        refreshPromise = axios
            .post(`${API_URL}/api/auth/token`, { token: refreshToken })
            .then((res) => {
                accessToken = res.data.accessToken
                return accessToken
            })
            .finally(() => { refreshPromise = null })
    }
    return refreshPromise
}

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
    if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        const status = error.response?.status
        const isAuthRoute = original?.url?.startsWith("/api/auth/")

        if (!original || original._retry || isAuthRoute || ![401, 403].includes(status)) {
            return Promise.reject(error)
        }
        original._retry = true

        try {
            // If another request already refreshed the token, just retry with it
            const usedHeader = original.headers.Authorization
            const token = usedHeader && usedHeader !== `Bearer ${accessToken}` && accessToken
                ? accessToken
                : await refreshAccessToken()
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
        } catch {
            onAuthFailure()
            return Promise.reject(error)
        }
    }
)

export default api
