import { apiBase } from '../lib/api'
import type { AuthCredentials, LoginResponse } from '../types'

export async function register(credentials: AuthCredentials): Promise<void> {
  const res = await fetch(`${apiBase}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) throw new Error('Registration failed')
}

export async function login(credentials: AuthCredentials): Promise<LoginResponse> {
  const res = await fetch(`${apiBase}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json() as Promise<LoginResponse>
}

export async function logout(token: string): Promise<void> {
  await fetch(`${apiBase}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
