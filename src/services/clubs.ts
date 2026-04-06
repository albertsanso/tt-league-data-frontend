import type { Club } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchClubs(): Promise<Club[]> {
  const res = await fetch(`${BASE_URL}/clubs`)
  if (!res.ok) throw new Error('Failed to fetch clubs')
  return res.json() as Promise<Club[]>
}
