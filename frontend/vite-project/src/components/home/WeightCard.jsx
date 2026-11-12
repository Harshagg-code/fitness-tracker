import { ArrowDown, ArrowUp, ArrowRight, RotateCcw } from "lucide-react"
import Card from "../Card"

const WeightCard = ({
    startingWeight, weightHistory,
    weightInput, setWeightInput,
    dailyWeightInput, setDailyWeightInput,
    onSetStart, onLog, onReset, onTrend,
}) => {
    const current = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null
    const lost = startingWeight && current !== null ? current < startingWeight.weight : false
    const diff = startingWeight && current !== null ? Math.abs(current - startingWeight.weight).toFixed(1) : null

    return (
        <Card
            title="Weight"
            action={
                <button onClick={onReset} className="btn btn-ghost btn-xs rounded-full text-base-content/60">
                    <RotateCcw className="w-3 h-3" /> Reset
                </button>
            }
        >
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-base-200 rounded-field p-3">
                    <p className="text-xs text-base-content/60">Start</p>
                    <p className="mt-1 text-lg font-bold">{startingWeight ? `${startingWeight.weight}kg` : "-"}</p>
                </div>
                <div className="bg-base-200 rounded-field p-3">
                    <p className="text-xs text-base-content/60">Change</p>
                    {diff !== null ? (
                        <p className={`mt-1 text-lg font-bold flex items-center justify-center ${lost ? "text-success" : "text-error"}`}>
                            {lost ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                            {diff}
                        </p>
                    ) : (
                        <p className="mt-1 text-lg font-bold">-</p>
                    )}
                </div>
                <div className="bg-primary/30 rounded-field p-3">
                    <p className="text-xs text-base-content/60">Current</p>
                    <p className="mt-1 text-lg font-bold">{current !== null ? `${current}kg` : "-"}</p>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                {!startingWeight ? (
                    <>
                        <input
                            type="number"
                            step="0.1"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            placeholder="Starting weight (kg)"
                            className="input input-sm flex-1 min-w-0 rounded-full bg-base-200 border-transparent"
                        />
                        <button onClick={onSetStart} className="btn btn-primary btn-sm rounded-full">Set</button>
                    </>
                ) : (
                    <>
                        <input
                            type="number"
                            step="0.1"
                            value={dailyWeightInput}
                            onChange={(e) => setDailyWeightInput(e.target.value)}
                            placeholder="Today's weight (kg)"
                            className="input input-sm flex-1 min-w-0 rounded-full bg-base-200 border-transparent"
                        />
                        <button onClick={onLog} className="btn btn-primary btn-sm rounded-full">Log</button>
                    </>
                )}
            </div>

            <button onClick={onTrend} className="btn btn-ghost btn-sm rounded-full self-start mt-2 -ml-2">
                See full trend <ArrowRight className="w-4 h-4" />
            </button>
        </Card>
    )
}

export default WeightCard
