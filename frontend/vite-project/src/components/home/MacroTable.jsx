import Card from "../Card"

const MacroTable = ({ rows }) => {
    const macros = rows.filter((r) => r.stack)
    const total = macros.reduce((sum, r) => sum + r.intake, 0)

    return (
        <Card title="Calories Analysis" className="h-full">
            {/* Stacked share bar */}
            <div className="h-2 rounded-full overflow-hidden bg-base-200 mb-4">
                <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-full block">
                    {total > 0 &&
                        macros.reduce(
                            (acc, r) => {
                                const w = (r.intake / total) * 100
                                acc.nodes.push(
                                    <rect key={r.label} x={acc.x} y="0" width={w} height="8" fill="currentColor" className={r.fill} />
                                )
                                acc.x += w
                                return acc
                            },
                            { x: 0, nodes: [] }
                        ).nodes}
                </svg>
            </div>

            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_3rem] gap-x-2 text-xs text-base-content/60 pb-2">
                <span>Nutrient</span>
                <span>Intake</span>
                <span>Goal</span>
                <span className="text-right">%</span>
            </div>
            <div className="flex flex-col">
                {rows.map((r) => {
                    const pct = r.goal ? Math.round((r.intake / r.goal) * 100) : null
                    return (
                        <div
                            key={r.label}
                            className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_3rem] gap-x-2 items-center py-3 border-t border-base-200 text-sm"
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.dot}`} />
                                {r.label}
                            </span>
                            <span>{r.intake.toFixed(r.decimals)}{r.unit}</span>
                            <span className="text-base-content/60">{r.goal ? `${r.goal}${r.unit}` : "-"}</span>
                            <span className={`text-right font-semibold ${pct !== null && pct > 100 ? "text-error" : ""}`}>
                                {pct !== null ? `${pct}%` : "-"}
                            </span>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

export default MacroTable
