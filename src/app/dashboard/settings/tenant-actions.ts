'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantName(name: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Get the tenant_id from the user profile
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (userError || !userData?.tenant_id) {
        return { success: false, error: 'Tenant not found.' };
    }

    // Using admin client for the update to bypass RLS for tenant-level changes,
    // after verifying ownership via the user-context client.
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data: updateData, error: updateError } = await adminSupabase
        .from('tenants')
        .update({ name })
        .eq('id', userData.tenant_id)
        .select();

    if (updateError) {
        console.error('Error updating tenant name with admin client:', updateError);
        return { success: false, error: updateError.message };
    }

    if (!updateData || updateData.length === 0) {
        console.error('No tenant updated for id:', userData.tenant_id);
        return { success: false, error: 'Access denied or tenant not found.' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
