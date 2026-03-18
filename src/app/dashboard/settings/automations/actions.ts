'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cleanPhone } from '@/lib/utils';

export async function saveAutomation(data: {
// ... existing code
    id?: string;
    name: string;
    trigger_event: string;
    trigger_condition?: any;
    template_id: string;
    is_active: boolean;
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

    const { template, ...automationData } = data as any;

    const payload = {
        ...automationData,
        tenant_id: profile.tenant_id,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('automations')
        .upsert(payload, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/automations');
    return { success: true };
}

export async function deleteAutomation(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/automations');
    return { success: true };
}

export async function toggleAutomation(id: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('automations')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/automations');
    return { success: true };
}

export async function saveAppointmentSettings(data: {
    reminder_1h_template_id: string | null;
    reminder_30m_template_id: string | null;
    notify_professional_30m: boolean;
    professional_phone: string | null;
    professional_email: string | null;
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

    const { error } = await supabase
        .from('appointment_settings')
        .upsert({
            tenant_id: profile.tenant_id,
            ...data,
            professional_phone: data.professional_phone ? cleanPhone(data.professional_phone) : null,
            updated_at: new Date().toISOString()
        });

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/settings/automations');
    return { success: true };
}

export async function getAppointmentSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
    
    if (!profile?.tenant_id) return null;

    const { data } = await supabase
        .from('appointment_settings')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .single();

    return data;
}
