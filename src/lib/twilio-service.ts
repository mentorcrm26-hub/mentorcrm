/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'

interface SendSMSParams {
    phone: string
    message: string
    tenantId: string
}

export async function sendTwilioSMS({ phone, message, tenantId }: SendSMSParams) {
    const supabase = await createClient()

    try {
        // Fetch Twilio credentials for this tenant
        const { data: integration } = await supabase
            .from('integrations')
            .select('credentials')
            .eq('tenant_id', tenantId)
            .eq('provider', 'twilio')
            .eq('is_active', true)
            .single()

        if (!integration || !integration.credentials) {
            return {
                success: false,
                error: 'Twilio provider not configured for this workspace.'
            }
        }

        const { accountSid, authToken, phoneNumber: fromNumber } = integration.credentials

        // Normalize destination number
        let toPhone = phone;
        let toDigits = phone.replace(/\D/g, '');

        if (!phone.startsWith('+')) {
            if (toDigits.length === 10) {
                // Missing country code, assume US
                toPhone = `+1${toDigits}`;
            } else if (toDigits.length === 11 && toDigits.startsWith('1')) {
                // Has US country code but missing +
                toPhone = `+${toDigits}`;
            } else {
                // Probably an international number or different format, just prepend +
                toPhone = `+${toDigits}`;
            }
        } else {
            // Remove everything except + and digits
            toPhone = `+${toDigits}`;
        }

        // Normalize From number equally (just in case it was saved without +)
        let finalFromNumber = fromNumber;
        let fromDigits = fromNumber.replace(/\D/g, '');
        if (!fromNumber.startsWith('+')) {
            if (fromDigits.length === 10) finalFromNumber = `+1${fromDigits}`;
            else finalFromNumber = `+${fromDigits}`;
        } else {
            finalFromNumber = `+${fromDigits}`;
        }

        // Send via Twilio API
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                To: toPhone,
                From: finalFromNumber,
                Body: message
            }).toString()
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Twilio Error:', errorData)
            return { success: false, error: errorData.message || 'Failed to send SMS.' }
        }

        const twilioRes = await response.json()
        console.log(`[SMS Sent] Message SID: ${twilioRes.sid}`)
        return { success: true, messageId: twilioRes.sid }

    } catch (error: any) {
        console.error('Twilio SMS Critical Error:', error)
        return { success: false, error: error.message || 'Error executing Twilio API.' }
    }
}
