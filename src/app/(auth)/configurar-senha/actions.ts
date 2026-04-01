'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function setPassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirm  = formData.get('confirm')  as string

    if (!password || password.length < 8) {
        redirect('/configurar-senha?error=A+senha+deve+ter+no+mínimo+8+caracteres.')
    }

    if (password !== confirm) {
        redirect('/configurar-senha?error=As+senhas+não+coincidem.')
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        redirect(`/configurar-senha?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')
}
