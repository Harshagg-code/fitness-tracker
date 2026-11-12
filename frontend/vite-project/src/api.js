// Base URL of the backend, without a trailing slash.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "")
