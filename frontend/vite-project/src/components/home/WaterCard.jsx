import { Plus, Minus, Check } from "lucide-react"

const WaterCard = ({ glasses, goal, mlPerGlass, onAdd, onRemove }) => (
    <section className="card bg-neutral text-neutral-content rounded-box p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold">Water intake</h2>
            <span className="text-xs text-neutral-content/60">{glasses} / {goal} glasses</span>
        </div>

        <p className="text-3xl font-bold leading-none">
            {glasses * mlPerGlass}
            <span className="text-sm font-normal text-neutral-content/60 ml-1">ml</span>
        </p>
        <p className="text-xs text-neutral-content/60 mt-2 flex items-center gap-1">
            {glasses >= goal ? (
                <><Check className="w-3 h-3" /> Goal reached</>
            ) : (
                `${(goal - glasses) * mlPerGlass} ml remaining`
            )}
        </p>

        <div className="flex gap-1.5 mt-5">
            {Array.from({ length: goal }, (_, i) => (
                <span key={i} className={`h-8 flex-1 rounded-md ${i < glasses ? "bg-primary" : "bg-neutral-content/15"}`} />
            ))}
        </div>

        <div className="flex gap-2 mt-5">
            <button onClick={onAdd} disabled={glasses >= goal} className="btn btn-primary btn-sm rounded-full">
                <Plus className="w-4 h-4" /> Glass
            </button>
            {glasses > 0 && (
                <button onClick={onRemove} className="btn btn-ghost btn-sm btn-circle text-neutral-content" aria-label="Remove glass">
                    <Minus className="w-4 h-4" />
                </button>
            )}
        </div>
    </section>
)

export default WaterCard
