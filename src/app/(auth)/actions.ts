'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=true&msg=' + encodeURIComponent(error.message))
    }

    const { data: { user } } = await supabase.auth.getUser()
    let dest = '/dashboard'

    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'super_admin') {
            dest = '/settings'
        }
    }

    revalidatePath('/', 'layout')
    redirect(dest)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const rawPhone = formData.get('phone') as string;
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('1') ? cleanPhone : `1${cleanPhone}`;

    // type-casting here for convenience
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('full_name') as string,
                phone: formattedPhone,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/signup?error=true&msg=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
