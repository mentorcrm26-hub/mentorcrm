'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLandingConfig() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('landing_page_config')
    .select('*')
    .eq('id', 'global')
    .single()

  if (error) {
    console.error('getLandingConfig error:', error)
    return null
  }
  return data
}

export async function updateLandingConfig(formData: any) {
  const supabase = await createClient()
  
  // Confirmação dupla de segurança no servidor
  const { data: isAdmin } = await supabase.rpc('is_super_admin')
  
  if (!isAdmin) {
    return { success: false, error: 'Acesso Negado: Apenas Super Admins podem alterar a página de vendas.' }
  }

  const { error } = await supabase
    .from('landing_page_config')
    .update({ 
        ...formData, 
        updated_at: new Date().toISOString() 
    })
    .eq('id', 'global')

  if (error) {
    console.error('updateLandingConfig error:', error)
    return { success: false, error: 'Erro ao salvar no banco de dados.' }
  }

  // Isso limpa o cache da Home Page forçando ela a recarregar as informações imediatamente.
  revalidatePath('/', 'layout')
  
  return { success: true }
}
