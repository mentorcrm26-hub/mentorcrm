export type Drawing = {
    id: string
    tenant_id: string
    created_by: string | null
    title: string
    canvas_data: Record<string, unknown>  // Fabric.js JSON schema
    thumbnail_url: string | null
    width: number
    height: number
    created_at: string
    updated_at: string
    // Computed from JOIN with drawing_leads
    linked_leads_count?: number
}

export type DrawingLead = {
    id: string
    drawing_id: string
    lead_id: string
    tenant_id: string
    linked_at: string
    // Joined from leads table
    lead?: {
        id: string
        name: string
        email: string | null
    }
}
