import { ChevronDown, ChevronUp, X } from "lucide-react"
import Card from "../Card"

const MealSection = ({ label, time, logs, collapsed, onToggle, onDelete }) => {
    const calories = logs.reduce((sum, l) => sum + l.calories, 0)
    const Chevron = collapsed ? ChevronDown : ChevronUp

    return (
        <Card>
            <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={!collapsed}>
                <div>
                    <p className="text-base font-semibold">{label}</p>
                    <p className="text-xs text-base-content/60">{time}</p>
                </div>
                <div className="flex items-center gap-2">
                    {calories > 0 && (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-content">
                            {calories.toFixed(0)} kcal
                        </span>
                    )}
                    <Chevron className="w-4 h-4 text-base-content/60" />
                </div>
            </button>

            {!collapsed && (
                <div className="mt-3 flex flex-col">
                    {logs.length === 0 && <p className="text-xs text-base-content/60 pt-3 border-t border-base-200">No foods logged yet</p>}
                    {logs.map((log) => (
                        <div key={log._id} className="flex items-center justify-between gap-2 py-3 border-t border-base-200">
                            <div className="min-w-0">
                                <p className="text-sm font-medium capitalize truncate">{log.name}</p>
                                <p className="text-xs text-base-content/60">
                                    {log.calories} kcal · P {log.protein}g · C {log.carbs}g · F {log.fat}g
                                </p>
                            </div>
                            <button onClick={() => onDelete(log._id)} className="btn btn-ghost btn-xs btn-circle" aria-label={`Remove ${log.name}`}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}

export default MealSection
