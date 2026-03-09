import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Leaf, Mail, Lock, User, UserPlus } from "lucide-react"

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
            toast.error("Registration failed. Try again.")
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
                    <p className="text-base-content/50 mt-1 text-sm">Create your account to get started</p>
                </div>

                {/* Card */}
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body gap-5">

                        {/* Username */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Username</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="text"
                                    placeholder="your username"
                                    className="grow"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>
                        </div>

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
                                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                                />
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            onClick={handleRegister}
                            className={`btn btn-primary w-full mt-1 ${loading ? "loading" : ""}`}
                        >
                            {!loading && <UserPlus className="w-4 h-4 mr-1" />}
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                        <div className="divider text-xs text-base-content/30 my-0">or</div>

                        <p className="text-center text-sm text-base-content/50">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage