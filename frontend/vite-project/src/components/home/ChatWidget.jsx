import ReactMarkdown from "react-markdown"
import { Bot, X, Send } from "lucide-react"

const SUGGESTIONS = ["How am I doing today?", "What should I eat for dinner?", "Am I getting enough protein?"]

const ChatWidget = ({ open, setOpen, messages, input, setInput, loading, onSend, user }) => (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
        {open && (
            <div className="card bg-base-100 rounded-box shadow-xl w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[70vh] flex flex-col overflow-hidden">
                <div className="bg-primary text-primary-content px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5" />
                        <div>
                            <p className="text-base font-semibold leading-tight">Nutrition Coach</p>
                            <p className="text-xs opacity-70">Ask about today's food, goals or meals</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm btn-circle" aria-label="Close chat">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
                    ref={(el) => el && el.scrollTo(0, el.scrollHeight)}
                >
                    {messages.length === 0 && (
                        <div className="text-center mt-6">
                            <Bot className="w-10 h-10 text-base-content/30 mx-auto mb-3" />
                            <p className="text-sm text-base-content/60">Hi {user}, ask me anything about your nutrition today.</p>
                            <div className="flex flex-col gap-2 mt-4">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button key={suggestion} onClick={() => setInput(suggestion)} className="btn btn-sm btn-ghost bg-base-200 rounded-full">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`rounded-box px-4 py-2 max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-content rounded-br-sm" : "bg-base-200 rounded-bl-sm"}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-base-200 rounded-box rounded-bl-sm px-4 py-3">
                                <span className="loading loading-dots loading-sm"></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-base-200 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSend()}
                        placeholder="Ask your nutrition coach"
                        className="input input-sm flex-1 min-w-0 rounded-full bg-base-200 border-transparent"
                    />
                    <button onClick={onSend} className="btn btn-primary btn-sm btn-circle" disabled={loading} aria-label="Send">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
        <button onClick={() => setOpen(!open)} className="btn btn-primary btn-circle w-14 h-14 shadow-lg" aria-label="Toggle nutrition coach">
            {open ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
        </button>
    </div>
)

export default ChatWidget
