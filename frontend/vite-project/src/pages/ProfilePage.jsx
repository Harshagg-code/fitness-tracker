import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, User, Ruler, Weight, Activity, Save, Leaf } from "lucide-react"

const ProfilePage = () => {
    const [age, setAge] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [gender, setGender] = useState("male")
    const [activityLevel, setActivityLevel] = useState("sedentary")
    const [calorieGoal, setCalorieGoal] = useState(null)
    const [loading, setLoading] = useState(false)
    const { accessToken } = useAuth()
    const navigate = useNavigate()

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/profile", getAuthHeaders())
                const { age, height, weight, gender, activityLevel, calorieGoal } = res.data
                if (age) setAge(age)
                if (height) setHeight(height)
                if (weight) setWeight(weight)
                if (gender) setGender(gender)
                if (activityLevel) setActivityLevel(activityLevel)
                if (calorieGoal) setCalorieGoal(calorieGoal)
            } catch (error) {
                console.error("Error fetching profile", error)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async () => {
        if (!age || !height || !weight) { toast.error("Please fill in all fields"); return }
        setLoading(true)
        try {
            const res = await axios.put(
                "http://localhost:5001/api/profile",
                { age: Number(age), height: Number(height), weight: Number(weight), gender, activityLevel },
                getAuthHeaders()
            )
            setCalorieGoal(res.data.calorieGoal)
            toast.success("Profile saved!")
        } catch (error) {
            toast.error("Failed to save profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200">

            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-6">
                <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-2 ml-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-primary">My Profile</span>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Form */}
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body gap-5">
                        <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Your Details</h2>

                        {/* Age */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Age</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="number"
                                    placeholder="25"
                                    className="grow"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                                <span className="text-xs text-base-content/30">yrs</span>
                            </label>
                        </div>

                        {/* Height */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Height</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="number"
                                    placeholder="175"
                                    className="grow"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                />
                                <span className="text-xs text-base-content/30">cm</span>
                            </label>
                        </div>

                        {/* Weight */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Weight</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <Weight className="w-4 h-4 text-base-content/40" />
                                <input
                                    type="number"
                                    placeholder="70"
                                    className="grow"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                                <span className="text-xs text-base-content/30">kg</span>
                            </label>
                        </div>

                        {/* Gender */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Gender</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {/* Activity Level */}
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-medium text-xs uppercase tracking-widest text-base-content/50">Activity Level</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 h-auto py-2">
                                <Activity className="w-4 h-4 text-base-content/40 shrink-0" />
                                <select
                                    className="grow bg-transparent border-none outline-none text-sm"
                                    value={activityLevel}
                                    onChange={(e) => setActivityLevel(e.target.value)}
                                >
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Light (1-3 days/week)</option>
                                    <option value="moderate">Moderate (3-5 days/week)</option>
                                    <option value="active">Active (6-7 days/week)</option>
                                    <option value="very_active">Very Active (hard exercise daily)</option>
                                </select>
                            </label>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className={`btn btn-primary w-full mt-1 ${loading ? "loading" : ""}`}
                        >
                            {!loading && <Save className="w-4 h-4 mr-1" />}
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>

                {/* Calorie Result */}
                {calorieGoal && (
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body text-center">
                            <p className="text-xs uppercase tracking-widest text-base-content/50 font-bold">Daily Maintenance Calories</p>
                            <p className="text-6xl font-bold text-primary mt-2">{calorieGoal}</p>
                            <p className="text-base-content/40 text-sm">kcal / day</p>
                            <div className="divider"></div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Lose Weight", value: calorieGoal - 500, color: "text-error" },
                                    { label: "Maintain", value: calorieGoal, color: "text-primary" },
                                    { label: "Gain Weight", value: calorieGoal + 500, color: "text-success" },
                                ].map((item) => (
                                    <div key={item.label} className="bg-base-200 rounded-xl p-3">
                                        <p className="text-xs text-base-content/50 mb-1">{item.label}</p>
                                        <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
                                        <p className="text-xs text-base-content/40">kcal</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage