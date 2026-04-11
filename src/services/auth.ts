import { requestJson, requestVoid } from '../lib/rest-adapter'
import type { AuthCredentials, LoginResponse, Users } from '../types'

export async function register(credentials: AuthCredentials): Promise<Users> {
  return requestJson<Users>('/api/v1/auth/register', {
    method: 'POST',
    jsonBody: credentials,
    fallbackErrorMessage: 'Registration failed',
  })
}

export async function login(credentials: AuthCredentials): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    jsonBody: credentials,
    fallbackErrorMessage: 'Login failed',
  })
}

export async function logout(token: string): Promise<void> {
  await requestVoid('/api/v1/auth/logout', {
    method: 'POST',
    token,
    fallbackErrorMessage: 'Logout failed',
  })
}
