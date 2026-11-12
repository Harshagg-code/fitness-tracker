import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Mail, Lock, LogIn } from "lucide-react"
import AuthLayout from "../components/AuthLayout"
import FormField from "../components/FormField"

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async () => {
        if (!email || !password) { toast.error("Please fill in all fields"); return }
        setLoading(true)
        try {
            await login(email, password)
            toast.success("Logged in successfully!")
            navigate("/")
        } catch {
            toast.error("Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Fitness Tracker"
            subtitle="Welcome back. Let's track your day."
            footer={<>Don't have an account?{" "}<Link to="/register" className="text-base-content font-semibold underline">Register</Link></>}
        >
            <FormField label="Email" icon={Mail}>
                <input
                    type="email"
                    placeholder="your@email.com"
                    className="grow min-w-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
            </FormField>

            <FormField label="Password" icon={Lock}>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="grow min-w-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
            </FormField>

            <button onClick={handleLogin} className="btn btn-primary rounded-full w-full mt-2">
                {loading ? <span className="loading loading-spinner loading-xs" /> : <LogIn className="w-4 h-4" />}
                {loading ? "Logging in" : "Login"}
            </button>
        </AuthLayout>
    )
}

export default LoginPage
