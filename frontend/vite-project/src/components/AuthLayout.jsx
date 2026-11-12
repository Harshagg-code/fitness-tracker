import { Leaf } from "lucide-react"
import Card from "./Card"

const AuthLayout = ({ title, subtitle, footer, children }) => (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-neutral text-primary flex items-center justify-center mb-4">
                    <Leaf className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>
            </div>
            <Card>
                <div className="flex flex-col gap-4">{children}</div>
            </Card>
            <p className="text-center text-sm text-base-content/60 mt-5">{footer}</p>
        </div>
    </div>
)

export default AuthLayout
