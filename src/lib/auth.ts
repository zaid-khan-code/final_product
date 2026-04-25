import { cookies } from 'next/headers'
import { jwtVerify, type JWTPayload } from 'jose'
import { type EmsRole } from '@/lib/roles'
import { type SessionUser } from '@/lib/session'

const JWT_COOKIE = 'ems_jwt'
const USER_COOKIE = 'ems_user'
const CSRF_COOKIE = 'ems_csrf'

type TokenClaims = JWTPayload & {
  user_id: string
  role: EmsRole
  employee_id?: string | null
  is_super_admin?: boolean
}

type StoredUserCookie = {
  id?: string
  email?: string | null
  role?: EmsRole
  employee_id?: string | null
}

const noStoreHeaders = {
  'Cache-Control': 'no-store',
}

const getRequiredEnv = (name: 'BACKEND_API_URL' | 'JWT_SECRET') => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const getBackendApiUrl = () => getRequiredEnv('BACKEND_API_URL').replace(/\/$/, '')

const getJwtSecret = () => new TextEncoder().encode(getRequiredEnv('JWT_SECRET'))

export const getNoStoreHeaders = () => noStoreHeaders

export const getCookieNames = () => ({
  jwt: JWT_COOKIE,
  user: USER_COOKIE,
  csrf: CSRF_COOKIE,
})

export const getHttpOnlyCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})

export const getReadableCookieOptions = () => ({
  httpOnly: false,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})

export const createCsrfToken = () => crypto.randomUUID().replace(/-/g, '')

export const encodeUserCookie = (user: StoredUserCookie) => {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url')
}

export const decodeUserCookie = (value: string | undefined) => {
  if (!value) return null

  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as StoredUserCookie
  } catch {
    return null
  }
}

export const buildSessionUser = (claims: TokenClaims, storedUser?: StoredUserCookie | null): SessionUser => ({
  id: storedUser?.id ?? claims.user_id,
  email: storedUser?.email ?? null,
  role: storedUser?.role ?? claims.role,
  employee_id: storedUser?.employee_id ?? claims.employee_id ?? null,
  is_super_admin: Boolean(claims.is_super_admin),
})

export const verifySessionToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getJwtSecret())
  return payload as TokenClaims
}

export const getSessionUserFromCookies = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(JWT_COOKIE)?.value

  if (!token) return null

  try {
    const claims = await verifySessionToken(token)
    const storedUser = decodeUserCookie(cookieStore.get(USER_COOKIE)?.value)
    return buildSessionUser(claims, storedUser)
  } catch {
    return null
  }
}

export const validateCsrfRequest = async (request: Request) => {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD') return true

  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value
  const csrfHeader = request.headers.get('x-csrf-token')

  return Boolean(csrfCookie && csrfHeader && csrfCookie === csrfHeader)
}
