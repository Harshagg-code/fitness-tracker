import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)
    // True while a stored refresh token is being exchanged for a session on page load
    const [loading, setLoading] = useState(() => !!localStorage.getItem("refreshToken"))

    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return
        let cancelled = false

        const restoreSession = async () => {
            try {
                const tokenRes = await axios.post(`${API_URL}/api/auth/token`, { token: refreshToken })
                const newToken = tokenRes.data.accessToken
                const profileRes = await axios.get(`${API_URL}/api/profile`, {
                    headers: { Authorization: `Bearer ${newToken}` }
                })
                if (cancelled) return
                setAccessToken(newToken)
                setUser(profileRes.data.username)
            } catch (err) {
                // Drop the stored token only if the server rejected it, not on network errors
                if (err.response && [401, 403].includes(err.response.status)) {
                    localStorage.removeItem("refreshToken")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        restoreSession()
        return () => { cancelled = true }
    }, [])

    const register = async (username, email, password) => {
        const res = await axios.post(`${API_URL}/api/auth/register`, {
            username, email, password
        })
        return res.data
    }

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
            email, password
        })
        setAccessToken(res.data.accessToken)
        setUser(res.data.username)
        localStorage.setItem("refreshToken", res.data.refreshToken)
        return res.data
    }

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        await axios.delete(`${API_URL}/api/auth/logout`, {
            data: { token: refreshToken }
        })
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem("refreshToken")
    }

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return null
        const res = await axios.post(`${API_URL}/api/auth/token`, {
            token: refreshToken
        })
        setAccessToken(res.data.accessToken)
        return res.data.accessToken
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, register, login, logout, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)







// Harris-Benedict Equation