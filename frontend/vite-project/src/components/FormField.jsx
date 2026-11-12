const FormField = ({ label, icon, unit, bare = false, children }) => {
    const Icon = icon
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{label}</span>
            {bare ? (
                children
            ) : (
                <label className="input w-full rounded-full bg-base-200 border-transparent flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-base-content/60 shrink-0" />}
                    {children}
                    {unit && <span className="text-xs text-base-content/60">{unit}</span>}
                </label>
            )}
        </div>
    )
}

export default FormField
