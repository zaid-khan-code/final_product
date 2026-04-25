import { NextResponse } from 'next/server'
import { getCookieNames, getHttpOnlyCookieOptions, getNoStoreHeaders, getReadableCookieOptions, validateCsrfRequest } from '@/lib/auth'

export async function POST(request: Request) {
  const isValidCsrf = await validateCsrfRequest(request)
  if (!isValidCsrf) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403, headers: getNoStoreHeaders() })
  }

  const cookieNames = getCookieNames()
  const response = NextResponse.json({ ok: true }, { headers: getNoStoreHeaders() })
  response.cookies.set(cookieNames.jwt, '', { ...getHttpOnlyCookieOptions(), expires: new Date(0), maxAge: 0 })
  response.cookies.set(cookieNames.user, '', { ...getHttpOnlyCookieOptions(), expires: new Date(0), maxAge: 0 })
  response.cookies.set(cookieNames.csrf, '', { ...getReadableCookieOptions(), expires: new Date(0), maxAge: 0 })
  return response
}
