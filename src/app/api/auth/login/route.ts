import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  buildSessionUser,
  createCsrfToken,
  encodeUserCookie,
  getBackendApiUrl,
  getCookieNames,
  getHttpOnlyCookieOptions,
  getNoStoreHeaders,
  getReadableCookieOptions,
  verifySessionToken,
} from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

type BackendLoginResponse = {
  token: string
  user: {
    id: string
    email: string
    role: string
    employee_id?: string | null
  }
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Validation failed', issues: [{ path: ['body'], message: 'Expected valid JSON object' }] },
      { status: 422, headers: getNoStoreHeaders() }
    )
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422, headers: getNoStoreHeaders() }
    )
  }

  const backendResponse = await fetch(`${getBackendApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  const rawText = await backendResponse.text()
  const contentType = backendResponse.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') && rawText ? (JSON.parse(rawText) as BackendLoginResponse | { error?: string }) : rawText

  if (!backendResponse.ok) {
    if (contentType.includes('application/json')) {
      return NextResponse.json(payload, { status: backendResponse.status, headers: getNoStoreHeaders() })
    }

    return new NextResponse(rawText, {
      status: backendResponse.status,
      headers: getNoStoreHeaders(),
    })
  }

  const loginPayload = payload as BackendLoginResponse
  const claims = await verifySessionToken(loginPayload.token)
  const sessionUser = buildSessionUser(claims, loginPayload.user)
  const csrfToken = createCsrfToken()
  const cookieNames = getCookieNames()

  const response = NextResponse.json({ user: sessionUser }, { headers: getNoStoreHeaders() })
  response.cookies.set(cookieNames.jwt, loginPayload.token, getHttpOnlyCookieOptions())
  response.cookies.set(cookieNames.user, encodeUserCookie(loginPayload.user), getHttpOnlyCookieOptions())
  response.cookies.set(cookieNames.csrf, csrfToken, getReadableCookieOptions())
  return response
}
