import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=no_code`)
    }

    try {
        const urlObj = new URL(request.url)
        const host = request.headers.get('host') || urlObj.host
        const forwardedProto = request.headers.get('x-forwarded-proto')
        const protocol = forwardedProto ? `${forwardedProto}:` : urlObj.protocol
        const redirectUri = `${protocol}//${host}/api/auth/google/callback`

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        )

        const { tokens } = await oauth2Client.getToken(code)
        
        // Connect to Supabase
        const supabase = await createClient()

        // Get the Google User info to store the email
        oauth2Client.setCredentials(tokens)
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        const { data: calendarList } = await calendar.calendarList.list()
        const primary = calendarList.items?.find(c => c.primary)
        const email = primary?.id || 'Google Account'

        // Get current user tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: userProfile } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!userProfile?.tenant_id) {
            return new NextResponse('Tenant not found', { status: 404 })
        }

        // Save to integrations
        const { error } = await supabase
            .from('integrations')
            .upsert({
                tenant_id: userProfile.tenant_id,
                provider: 'google',
                credentials: {
                    tokens,
                    email
                },
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'tenant_id,provider'
            })

        if (error) {
            console.error('Database Error saving Google tokens:', error)
            return new NextResponse(`
                <html>
                    <script>
                        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'db_save_failed' }, '*');
                        window.close();
                    </script>
                </html>
            `, { headers: { 'Content-Type': 'text/html' } })
        }

        return new NextResponse(`
            <html>
                <script>
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
                    window.close();
                </script>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } })

    } catch (error) {
        console.error('Google OAuth Error:', error)
        return new NextResponse(`
            <html>
                <script>
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'oauth_failed' }, '*');
                    window.close();
                </script>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } })
    }
}
