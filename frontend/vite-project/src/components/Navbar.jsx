import { NavLink } from "react-router-dom"
import { Leaf, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const links = [
    { to: "/", label: "Home" },
    { to: "/weekly", label: "Weekly" },
    { to: "/meals", label: "Meals" },
    { to: "/profile", label: "Profile" },
]

const Navbar = () => {
    const { user, logout } = useAuth()

    return (
        <header className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Brand */}
                <div className="order-1 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-neutral text-primary flex items-center justify-center">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <span className="text-base font-semibold">Fitness Tracker</span>
                </div>

                {/* Pill tabs */}
                <nav className="order-3 md:order-2 w-full md:w-auto overflow-x-auto bg-base-100 rounded-full p-1 flex gap-1">
                    {links.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `flex-1 md:flex-none text-center px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                    ? "bg-primary text-primary-content"
                                    : "text-base-content/70 hover:bg-base-200"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + logout */}
                <div className="order-2 md:order-3 flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-base-100 rounded-full pl-1 pr-3 py-1">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold uppercase">
                            {user ? user.charAt(0) : ""}
                        </span>
                        <span className="hidden md:inline text-sm font-medium">{user}</span>
                    </div>
                    <button onClick={logout} className="btn btn-neutral btn-sm rounded-full" aria-label="Logout">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar
