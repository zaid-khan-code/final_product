import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_COOKIE = 'ems_jwt'

type SessionClaims = {
  role?: string
  employee_id?: string | null
  is_super_admin?: boolean
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET')
  }
  return new TextEncoder().encode(secret)
}

const getLoginUrl = (request: NextRequest) => {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return loginUrl
}

const verifyClaims = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as SessionClaims
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(JWT_COOKIE)?.value
  const claims = token ? await verifyClaims(token) : null
  const isAuthenticated = Boolean(claims)
  const isEmployee = claims?.role === 'employee'
  const hasEmployeeProfile = Boolean(claims?.employee_id)
  const isSuperAdmin = Boolean(claims?.is_super_admin)

  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(getLoginUrl(request))
  }

  if (pathname.startsWith('/config') && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/launchpad', request.url))
  }

  if (pathname.startsWith('/me')) {
    if (!hasEmployeeProfile) {
      return NextResponse.redirect(new URL('/launchpad', request.url))
    }
    return NextResponse.next()
  }

  const hrWorkspacePaths = ['/dashboard', '/employees', '/attendance', '/leave']
  if (isEmployee && hrWorkspacePaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(new URL('/me/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/launchpad',
    '/dashboard/:path*',
    '/employees/:path*',
    '/attendance/:path*',
    '/leave/:path*',
    '/me/:path*',
    '/config',
    '/config/:path*',
  ],
}
