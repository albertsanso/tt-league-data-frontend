import { apiBase } from '../lib/api'
import { readApiErrorMessage } from '../lib/read-api-error'
import type { AuthCredentials, LoginResponse, Users } from '../types'

export async function register(credentials: AuthCredentials): Promise<Users> {
  const res = await fetch(`${apiBase}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Registration failed')
  }
  return res.json() as Promise<Users>
}

export async function login(credentials: AuthCredentials): Promise<LoginResponse> {
  const res = await fetch(`${apiBase}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Login failed')
  }
  return res.json() as Promise<LoginResponse>
}

export async function logout(token: string): Promise<void> {
  const res = await fetch(`${apiBase}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Logout failed')
  }
}
