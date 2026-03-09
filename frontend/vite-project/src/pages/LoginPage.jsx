import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Leaf, Mail, Lock, LogIn } from "lucide-react"

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
        } catch (error) {
            toast.error("Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="w-full max-w-md px-6">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <Leaf className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary">Fitness Tracker</h1>
                    <p className="text-base-content/50 mt-1 text-sm">Welcome back — let's track your day</p>
                </div>

                {/* Card */}
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body gap-5">

                        {/* Email */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Email</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <Mail className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="grow"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                />
                            </label>
                        </div>

                        {/* Password */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Password</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <Lock className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="grow"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                />
                            </label>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleLogin}
                            className={`btn btn-primary w-full mt-1 ${loading ? "loading" : ""}`}
                        >
                            {!loading && <LogIn className="w-4 h-4 mr-1" />}
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="divider text-xs text-base-content/30 my-0">or</div>

                        <p className="text-center text-sm text-base-content/50">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage