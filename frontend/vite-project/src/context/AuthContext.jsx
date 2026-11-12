import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api, { API_URL, setAccessToken, setAuthFailureHandler, refreshAccessToken } from "../api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    // True while a stored refresh token is being exchanged for a session on page load
    const [loading, setLoading] = useState(() => !!localStorage.getItem("refreshToken"))
    const navigate = useNavigate()

    const clearSession = () => {
        setAccessToken(null)
        setUser(null)
        localStorage.removeItem("refreshToken")
    }

    // If a token refresh fails mid-session, log the user out and go to /login
    useEffect(() => {
        setAuthFailureHandler(() => {
            clearSession()
            navigate("/login")
        })
    }, [navigate])

    useEffect(() => {
        if (!localStorage.getItem("refreshToken")) return
        let cancelled = false

        const restoreSession = async () => {
            try {
                await refreshAccessToken()
                const profileRes = await api.get("/api/profile")
                if (cancelled) return
                setUser(profileRes.data.username)
            } catch (err) {
                // Drop the stored token only if the server rejected it, not on network errors
                if (err.response && [401, 403].includes(err.response.status)) {
                    clearSession()
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
        clearSession()
    }

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
