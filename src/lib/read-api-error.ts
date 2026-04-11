/** Best-effort parse of JSON error bodies (e.g. `ErrorResponse` from openapi.yaml). */
export async function readApiErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const data: unknown = await res.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message
    }
  } catch {
    // non-JSON or empty body
  }
  return undefined
}
