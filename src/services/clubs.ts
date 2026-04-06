import { apiBase } from '../lib/api'
import type { Club } from '../types'

export async function fetchClubs(): Promise<Club[]> {
  const res = await fetch(`${apiBase}/api/v1/club/find_by_similar_name?name=`)
  if (!res.ok) throw new Error('Failed to fetch clubs')
  return res.json() as Promise<Club[]>
}
