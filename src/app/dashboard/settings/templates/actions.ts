'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveTemplate(data: {
    id?: string;
    name: string;
    subject?: string;
    content: string;
    type: 'email' | 'whatsapp';
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
    
    if (!profile?.tenant_id) return { success: false, error: 'Tenant error' };

    const payload = {
        ...data,
        tenant_id: profile.tenant_id,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('message_templates')
        .upsert(payload, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/templates');
    return { success: true };
}

export async function deleteTemplate(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/templates');
    return { success: true };
}
