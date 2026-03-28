/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

export type Lead = {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    birth_date: string | null
    meeting_at: string | null
    status: string
    created_at: string
    tenant_id: string
    apple_event_id?: string | null
    google_event_id?: string | null
    tags?: LeadTag[]
}

export type LeadTag = {
    id: string
    name: string
    color_hex: string
    tenant_id: string
}

export type LeadNote = {
    id: string
    content: string
    created_at: string
    is_legacy?: boolean
}
