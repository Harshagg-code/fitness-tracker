const StatTile = ({ icon, label, value, unit, sub }) => {
    const Icon = icon
    return (
    <div className="card bg-base-100 rounded-box p-5">
        <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-base-content/60">{label}</p>
            <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <Icon className="w-4 h-4" />
            </span>
        </div>
        <p className="mt-4 text-3xl font-bold leading-none">
            {value}
            {unit && <span className="text-sm font-normal text-base-content/60 ml-1">{unit}</span>}
        </p>
        {sub && <p className="text-xs text-base-content/60 mt-2">{sub}</p>}
    </div>
    )
}

export default StatTile
