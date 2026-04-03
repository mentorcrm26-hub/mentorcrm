'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/utils'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
})

export async function login(formData: FormData) {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? headersList.get('x-real-ip')
        ?? 'anonymous'

    const { success } = await ratelimit.limit(`login:${ip}`)

    if (!success) {
        redirect('/login?error=true&msg=' + encodeURIComponent('MUITAS TENTATIVAS. AGUARDE 15 MINUTOS E TENTE NOVAMENTE.'))
    }
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

        // Also check if super admin via RPC (more robust)
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

        const tenant = (dbProfile?.tenants as any)
        const isVip = tenant?.is_vip === true
        const plan = tenant?.plan || user.user_metadata?.plan || 'sandbox'

        if (isSuperAdmin || dbProfile?.role === 'super_admin') {
            dest = '/admin'
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

    const email = (formData.get('email') as string).trim().toLowerCase();
    const cookieStore = await cookies();
    const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';

    // 1. Check for duplicate Email in public.users (Case-Insensitive)
    const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .ilike('email', email) // Using ilike for case-insensitivity
        .maybeSingle();

    if (existingEmail) {
        const msg = lang === 'pt' ? 'ESTE E-MAIL JÁ ESTÁ EM USO.' : lang === 'es' ? 'ESTE E-MAIL YA ESTÁ EN USO.' : 'THIS EMAIL IS ALREADY IN USE.';
        return redirect(`/signup?error=true&plan=${plan}&msg=` + encodeURIComponent(msg));
    }

    // 2. Check for duplicate Phone in public.users
    const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', formattedPhone)
        .maybeSingle();

    if (existingPhone) {
        const msg = lang === 'pt' ? 'ESTE TELEFONE JÁ ESTÁ EM USO.' : lang === 'es' ? 'ESTE TELÉFONO YA ESTÁ EN USO.' : 'THIS PHONE IS ALREADY IN USE.';
        return redirect(`/signup?error=true&plan=${plan}&msg=` + encodeURIComponent(msg));
    }

    const data = {
        email,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: (formData.get('full_name') as string).trim(),
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
        return redirect(`/signup?error=true&plan=${plan}&msg=` + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')

    if (plan === 'sandbox') {
        return redirect('/demo')
    }
    return redirect('/dashboard')
}
