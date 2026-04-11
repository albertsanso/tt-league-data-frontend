import { requestJson, requestVoid } from '../lib/rest-adapter'
import type { AuthCredentials, LoginResponse, RegisterCredentials } from '../types'

/** Register response schema in OpenAPI is unconstrained (`{}`); parse as unknown. */
export async function register(credentials: RegisterCredentials): Promise<unknown> {
  return requestJson<unknown>('/api/v1/auth/register', {
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
