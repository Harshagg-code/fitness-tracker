const chips = [
    { key: "protein", label: "Protein", dot: "bg-primary" },
    { key: "carbs", label: "Carbs", dot: "bg-neutral" },
    { key: "fat", label: "Fat", dot: "bg-warning" },
]

const MacroChips = ({ protein, carbs, fat, className = "" }) => {
    const values = { protein, carbs, fat }
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {chips.map(({ key, label, dot }) => (
                <span key={key} className="inline-flex items-center gap-2 rounded-full bg-base-200 px-3 py-1 text-xs font-medium">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label} {Number(values[key]).toFixed(1)}g
                </span>
            ))}
        </div>
    )
}

export default MacroChips
