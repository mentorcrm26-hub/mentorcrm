/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const nextUrl = request.nextUrl
    const tenantIdParam = nextUrl.searchParams.get('tenant_id')

    // Initial response
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser().
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Session Protection
    if (!user && (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin'))) {
        const url = nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. Redirect logged-in users hitting /login
    if (user && nextUrl.pathname === '/login') {
        const url = nextUrl.clone()
        const { data: isAdmin } = await supabase.rpc('is_super_admin')
        if (isAdmin) url.pathname = '/admin'
        else if (user.user_metadata?.plan === 'sandbox') url.pathname = '/demo'
        else url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // 3. NUCLEAR IMPERSONATION FIX: Redirect with Cookie
    // If a Super Admin passes tenant_id, we set the cookie AND redirect.
    // This forces the next request to HAVE the cookie in its headers.
    if (user && tenantIdParam && nextUrl.pathname.startsWith('/dashboard')) {
        const { data: isAdmin } = await supabase.rpc('is_super_admin')
        if (isAdmin) {
            console.log('Impersonation requested for tenant:', tenantIdParam)
            
            const redirectUrl = nextUrl.clone()
            redirectUrl.searchParams.delete('tenant_id') // Clean URL
            
            const response = NextResponse.redirect(redirectUrl)
            
            // Set the impersonation cookie on the REDIRECT response
            response.cookies.set('impersonated_tenant_id', tenantIdParam, { 
                path: '/', 
                maxAge: 3600,
                sameSite: 'lax',
                httpOnly: true 
            })
            
            return response
        }
    }

    // 4. Auto-clear impersonation only on direct navigation to admin (GET)
    // This prevents clearing it when the server action is running (POST)
    if (request.method === 'GET' && nextUrl.pathname.startsWith('/admin')) {
        if (request.cookies.has('impersonated_tenant_id')) {
            supabaseResponse.cookies.delete('impersonated_tenant_id')
        }
    }

    return supabaseResponse
}
