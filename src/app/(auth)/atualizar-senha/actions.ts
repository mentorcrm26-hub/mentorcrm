'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
        redirect('/atualizar-senha?error=true&msg=' + encodeURIComponent('AS SENHAS NÃO COINCIDEM.'))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        redirect('/atualizar-senha?error=true&msg=' + encodeURIComponent(error.message))
    }

    redirect('/login?msg=' + encodeURIComponent('SENHA ATUALIZADA COM SUCESSO.'))
}
