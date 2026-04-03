/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/configurar-senha']
const ALLOWED_METHODS = new Set(['GET', 'POST', 'HEAD', 'OPTIONS'])

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (AUTH_ROUTES.some(route => pathname === route) && !ALLOWED_METHODS.has(request.method)) {
        return new NextResponse(null, { status: 405, headers: { Allow: 'GET, POST' } })
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
