export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
