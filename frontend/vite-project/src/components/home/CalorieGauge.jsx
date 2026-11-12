import { ArrowRight } from "lucide-react"
import Card from "../Card"

const CalorieGauge = ({ consumed, goal, onSetup }) => {
    const over = goal ? consumed > goal : false
    const pct = goal ? Math.min((consumed / goal) * 100, 100) : 0
    const remaining = goal ? goal - consumed : 0

    return (
        <Card title="Calories">
            {goal ? (
                <div className="flex flex-col gap-5 my-auto">
                    <div className="relative w-full max-w-xs mx-auto">
                        <svg viewBox="0 0 200 108" className="w-full h-auto">
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="16"
                                strokeLinecap="round"
                                className="text-base-200"
                            />
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="16"
                                strokeLinecap="round"
                                pathLength="100"
                                strokeDasharray={`${pct} 100`}
                                className={over ? "text-error" : "text-primary"}
                            />
                        </svg>
                        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                            <span className="text-3xl font-bold leading-none">{consumed.toFixed(0)}</span>
                            <span className="text-xs text-base-content/60 mt-1">of {goal} kcal ({pct.toFixed(0)}%)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary/30 rounded-field p-4">
                            <p className="text-sm font-medium">Consumed</p>
                            <p className="text-2xl font-bold mt-3 leading-none">
                                {consumed.toFixed(0)}
                                <span className="text-sm font-normal text-base-content/60 ml-1">kcal</span>
                            </p>
                        </div>
                        <div className="bg-primary/30 rounded-field p-4">
                            <p className="text-sm font-medium">{remaining < 0 ? "Over goal" : "Remaining"}</p>
                            <p className={`text-2xl font-bold mt-3 leading-none ${remaining < 0 ? "text-error" : ""}`}>
                                {Math.abs(remaining).toFixed(0)}
                                <span className="text-sm font-normal text-base-content/60 ml-1">kcal</span>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-base-content/60">Set up your profile to track your calorie goal.</p>
                    <button onClick={onSetup} className="btn btn-primary btn-sm rounded-full">
                        Set up profile <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </Card>
    )
}

export default CalorieGauge
