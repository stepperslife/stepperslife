import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/auth', '/auth/signin', '/auth/signup', '/auth/error', '/events', '/stores']
const adminRoutes = ['/admin']
const organizerRoutes = ['/organizer']
const vendorRoutes = ['/vendor']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth()

  // Check exact public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow public access to event and store detail pages
  if (
    pathname.startsWith('/events/') ||
    pathname.startsWith('/stores/') ||
    pathname.match(/^\/stores\/[^\/]+\/products\//)
  ) {
    return NextResponse.next()
  }

  // Allow NextAuth.js API routes (callbacks, signin, etc.)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  const userRole = session.user.role

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (organizerRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN' && userRole !== 'EVENT_ORGANIZER') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (vendorRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN' && userRole !== 'VENDOR') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos|icons|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.ico).*)',
  ],
}
