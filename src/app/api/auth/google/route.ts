/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const urlObj = new URL(request.url)
    const host = request.headers.get('host') || urlObj.host
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const protocol = forwardedProto ? `${forwardedProto}:` : urlObj.protocol
    const redirectUri = `${protocol}//${host}/api/auth/google/callback`
    console.log('DEBUG: Google Auth Initiated. Redirect URI:', redirectUri)

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    )

    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
    ]

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force to get refresh token
    })

    return NextResponse.redirect(url)
}
