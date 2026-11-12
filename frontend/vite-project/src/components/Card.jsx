const Card = ({ title, action, className = "", children }) => (
    <section className={`card bg-base-100 rounded-box p-5 ${className}`}>
        {(title || action) && (
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-semibold">{title}</h2>
                {action}
            </div>
        )}
        {children}
    </section>
)

export default Card
