'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/utils'

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
        // Fetch actual tenant status from DB instead of relying on Auth Metadata
        const { data: dbProfile } = await supabase
            .from('users')
            .select('role, tenants(plan, is_vip)')
            .eq('id', user.id)
            .single()

        const tenant = (dbProfile?.tenants as any)
        const isVip = tenant?.is_vip === true
        const plan = tenant?.plan || user.user_metadata?.plan || 'sandbox'

        if (dbProfile?.role === 'super_admin') {
            dest = '/settings'
        } else if (!isVip && plan === 'sandbox') {
            dest = '/demo'
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

    const validPlans = ['sandbox', 'agent', 'team'] as const;
    type Plan = typeof validPlans[number];
    const rawPlan = formData.get('plan') as string;
    const plan: Plan = validPlans.includes(rawPlan as Plan) ? (rawPlan as Plan) : 'agent';

    const trialEndsAt = plan === 'agent'
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('full_name') as string,
                phone: formattedPhone,
                plan,
                trial_ends_at: trialEndsAt,
                onboarding_status: plan === 'team' ? 'pending' : 'active',
            },
            emailRedirectTo: `${getAppUrl()}/auth/confirm?next=/login`,
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/signup?error=true&msg=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')

    if (plan === 'sandbox') {
        redirect('/demo')
    }
    redirect('/dashboard')
}
