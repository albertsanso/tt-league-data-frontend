// In dev: leave VITE_API_BASE_URL unset so relative /api/v1/* paths go through the Vite proxy.
// In production: set VITE_API_BASE_URL to the API host (e.g. https://api.example.com) — no trailing slash.
export const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
