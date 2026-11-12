import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Mail, Lock, User, UserPlus } from "lucide-react"
import AuthLayout from "../components/AuthLayout"
import FormField from "../components/FormField"

const RegisterPage = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleRegister = async () => {
        if (!username || !email || !password) { toast.error("Please fill in all fields"); return }
        setLoading(true)
        try {
            await register(username, email, password)
            toast.success("Registered successfully! Please login.")
            navigate("/login")
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed. Try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Track meals, water and weight in one place."
            footer={<>Already have an account?{" "}<Link to="/login" className="text-base-content font-semibold underline">Login</Link></>}
        >
            <FormField label="Username" icon={User}>
                <input
                    type="text"
                    placeholder="your username"
                    className="grow min-w-0"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </FormField>

            <FormField label="Email" icon={Mail}>
                <input
                    type="email"
                    placeholder="your@email.com"
                    className="grow min-w-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormField>

            <FormField label="Password" icon={Lock}>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="grow min-w-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
            </FormField>

            <button onClick={handleRegister} className="btn btn-primary rounded-full w-full mt-2">
                {loading ? <span className="loading loading-spinner loading-xs" /> : <UserPlus className="w-4 h-4" />}
                {loading ? "Creating account" : "Create account"}
            </button>
        </AuthLayout>
    )
}

export default RegisterPage
