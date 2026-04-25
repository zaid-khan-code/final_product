import { NextResponse } from 'next/server'
import { getBackendApiUrl, getCookieNames, getNoStoreHeaders, validateCsrfRequest } from '@/lib/auth'

type RouteContext = {
  params: Promise<{
    path?: string[]
  }>
}

const forward = async (request: Request, context: RouteContext) => {
  const isValidCsrf = await validateCsrfRequest(request)
  if (!isValidCsrf) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403, headers: getNoStoreHeaders() })
  }

  const method = request.method.toUpperCase()
  const { path = [] } = await context.params
  const upstreamUrl = new URL(`${getBackendApiUrl()}/${path.join('/')}`)
  upstreamUrl.search = new URL(request.url).search

  const cookieHeader = request.headers.get('cookie') ?? ''
  const jwtCookieName = `${getCookieNames().jwt}=`
  const token = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(jwtCookieName))
    ?.slice(jwtCookieName.length)

  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers: getNoStoreHeaders() })
  }

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token}`)

  const contentType = request.headers.get('content-type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text()
  const backendResponse = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    cache: 'no-store',
  })

  const responseHeaders = new Headers(getNoStoreHeaders())
  const responseContentType = backendResponse.headers.get('content-type')
  if (responseContentType) {
    responseHeaders.set('Content-Type', responseContentType)
  }

  return new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context)
}

export async function PUT(request: Request, context: RouteContext) {
  return forward(request, context)
}

export async function PATCH(request: Request, context: RouteContext) {
  return forward(request, context)
}

export async function DELETE(request: Request, context: RouteContext) {
  return forward(request, context)
}
