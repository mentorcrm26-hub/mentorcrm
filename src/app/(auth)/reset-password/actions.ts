'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
        redirect('/reset-password?error=true&msg=' + encodeURIComponent('PASSWORDS DO NOT MATCH.'))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        redirect('/reset-password?error=true&msg=' + encodeURIComponent(error.message))
    }

    redirect('/login?msg=' + encodeURIComponent('PASSWORD UPDATED SUCCESSFULLY.'))
}
