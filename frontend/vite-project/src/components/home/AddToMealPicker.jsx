const MEALS = ["breakfast", "lunch", "snacks", "dinner"]

const AddToMealPicker = ({ onPick, onCancel }) => (
    <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/60">Add to</p>
        <div className="grid grid-cols-2 gap-2">
            {MEALS.map((meal) => (
                <button
                    key={meal}
                    onClick={() => onPick(meal)}
                    className="btn btn-sm btn-primary rounded-full capitalize"
                >
                    {meal}
                </button>
            ))}
        </div>
        <button onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">Cancel</button>
    </div>
)

export default AddToMealPicker
