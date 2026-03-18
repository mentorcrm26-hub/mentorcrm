import { createClient } from './src/lib/supabase/server'

async function checkTable() {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('appointment_settings').select('*').limit(1)
        if (error) {
            console.error('TABLE ERROR:', error.message)
        } else {
            console.log('TABLE EXISTS')
        }
    } catch (e) {
        console.error('FETCH ERROR:', e)
    }
}

checkTable()
