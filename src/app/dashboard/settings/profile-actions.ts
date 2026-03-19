'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
    full_name: string;
    phone: string;
    google_meet_link: string;
    other_meet_link: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Final normalization: strip all non-digits and ensure +1
    let cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        cleanPhone = `+1${cleanPhone}`;
    } else if (cleanPhone.length > 10 && !data.phone.startsWith('+')) {
        cleanPhone = `+${cleanPhone}`;
    }

    const { error } = await supabase
        .from('users')
        .update({
            full_name: data.full_name,
            phone: cleanPhone,
            google_meet_link: data.google_meet_link,
            other_meet_link: data.other_meet_link,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
