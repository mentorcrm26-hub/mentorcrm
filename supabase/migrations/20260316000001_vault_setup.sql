-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Add archiving columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON leads(is_archived) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_leads_vault ON leads(is_archived) WHERE is_archived = TRUE;

-- Update RLS if necessary (usually not needed if already using select *)
-- But good to ensure labels are correct
COMMENT ON COLUMN leads.is_archived IS 'Whether the lead is hidden from the main Kanban board';
COMMENT ON COLUMN leads.archived_at IS 'When the lead was moved to the vault';
