'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/utils'

export async function requestPasswordReset(formData: FormData) {
    const email = (formData.get('email') as string).trim().toLowerCase()
    const supabase = await createClient()

    await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppUrl()}/auth/confirm?next=/atualizar-senha`,
    })

    redirect('/recuperar-senha?sent=true')
}
