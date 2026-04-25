import { NextResponse } from 'next/server'
import { getNoStoreHeaders, getSessionUserFromCookies } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUserFromCookies()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers: getNoStoreHeaders() })
  }

  return NextResponse.json({ user }, { headers: getNoStoreHeaders() })
}
