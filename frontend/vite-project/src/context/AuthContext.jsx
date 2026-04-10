import { createContext, useContext, useState } from "react"
import axios from "axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)

    const register = async (username, email, password) => {
        const res = await axios.post("https://fitness-tracker-y6q9.onrender.com//api/auth/register", {
            username, email, password
        })
        return res.data
    }

    const login = async (email, password) => {
        const res = await axios.post("https://fitness-tracker-y6q9.onrender.com//api/auth/login", {
            email, password
        })
        setAccessToken(res.data.accessToken)
        setUser(res.data.username)
        localStorage.setItem("refreshToken", res.data.refreshToken)
        return res.data
    }

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        await axios.delete("https://fitness-tracker-y6q9.onrender.com//api/auth/logout", {
            data: { token: refreshToken }
        })
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem("refreshToken")
    }

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return null
        const res = await axios.post("https://fitness-tracker-y6q9.onrender.com//api/auth/token", {
            token: refreshToken
        })
        setAccessToken(res.data.accessToken)
        return res.data.accessToken
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, register, login, logout, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)