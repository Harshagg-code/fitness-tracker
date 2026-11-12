import { useState, useEffect } from "react"
import api from "../api"
import toast from "react-hot-toast"
import Navbar from "../components/Navbar"
import { Calendar, Ruler, Weight, Save, ArrowDown, ArrowUp, Minus } from "lucide-react"
import Card from "../components/Card"
import FormField from "../components/FormField"

const ProfilePage = () => {
    const [age, setAge] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [gender, setGender] = useState("male")
    const [activityLevel, setActivityLevel] = useState("sedentary")
    const [calorieGoal, setCalorieGoal] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/profile")
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
            const res = await api.put(
                "/api/profile",
                { age: Number(age), height: Number(height), weight: Number(weight), gender, activityLevel }
            )
            setCalorieGoal(res.data.calorieGoal)
            toast.success("Profile saved!")
        } catch {
            toast.error("Failed to save profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 pb-10">

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">

                <div>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-sm text-base-content/60 mt-1">Your details set your daily calorie goal</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                    {/* Details form */}
                    <Card title="Your details">
                        <div className="flex flex-col gap-4">
                            <FormField label="Age" icon={Calendar} unit="yrs">
                                <input
                                    type="number"
                                    placeholder="25"
                                    className="grow min-w-0"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                            </FormField>

                            <FormField label="Height" icon={Ruler} unit="cm">
                                <input
                                    type="number"
                                    placeholder="175"
                                    className="grow min-w-0"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                />
                            </FormField>

                            <FormField label="Weight" icon={Weight} unit="kg">
                                <input
                                    type="number"
                                    placeholder="70"
                                    className="grow min-w-0"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </FormField>

                            <FormField label="Gender" bare>
                                <select
                                    className="select w-full rounded-full bg-base-200 border-transparent"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </FormField>

                            <FormField label="Activity level" bare>
                                <select
                                    className="select w-full rounded-full bg-base-200 border-transparent"
                                    value={activityLevel}
                                    onChange={(e) => setActivityLevel(e.target.value)}
                                >
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Light (1-3 days/week)</option>
                                    <option value="moderate">Moderate (3-5 days/week)</option>
                                    <option value="active">Active (6-7 days/week)</option>
                                    <option value="very_active">Very active (hard exercise daily)</option>
                                </select>
                            </FormField>

                            <button onClick={handleSave} className="btn btn-primary rounded-full w-full mt-1">
                                {loading ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-4 h-4" />}
                                {loading ? "Saving" : "Save profile"}
                            </button>
                        </div>
                    </Card>

                    {/* Calorie result */}
                    <Card title="Daily maintenance calories">
                        {calorieGoal ? (
                            <>
                                <p className="text-5xl font-bold leading-none">
                                    {calorieGoal}
                                    <span className="text-sm font-normal text-base-content/60 ml-2">kcal / day</span>
                                </p>
                                <div className="grid grid-cols-3 gap-3 mt-6">
                                    {[
                                        { label: "Lose", value: calorieGoal - 500, icon: ArrowDown, tint: "bg-base-200" },
                                        { label: "Maintain", value: calorieGoal, icon: Minus, tint: "bg-primary/30" },
                                        { label: "Gain", value: calorieGoal + 500, icon: ArrowUp, tint: "bg-base-200" },
                                    ].map((item) => (
                                        <div key={item.label} className={`${item.tint} rounded-field p-4`}>
                                            <item.icon className="w-4 h-4 mb-3" />
                                            <p className="text-xs text-base-content/60">{item.label}</p>
                                            <p className="text-xl font-bold mt-1 leading-none">{item.value}</p>
                                            <p className="text-xs text-base-content/60 mt-1">kcal</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-base-content/60">Save your details to see your daily calorie goal.</p>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default ProfilePage
