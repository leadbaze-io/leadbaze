-- Migration: Create CRM Integration Tables
-- Description: Tables to support multi-CRM integrations (Kommo, HubSpot, etc)
-- Author: LeadBaze Team
-- Date: 2026-01-26

-- Table: crm_integrations
-- Stores CRM credentials and configuration per user (multi-tenant)
CREATE TABLE IF NOT EXISTS crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_provider VARCHAR(50) NOT NULL, -- 'kommo', 'hubspot', 'rdstation', 'pipedrive', etc.
  
  -- OAuth Credentials (should be encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- CRM-specific configuration
  crm_config JSONB DEFAULT '{}', -- { account_id, subdomain, custom_fields_mapping, etc }
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one active integration per provider per user
  UNIQUE(user_id, crm_provider)
);

-- Table: crm_sync_logs
-- Stores history of lead synchronizations to CRM
CREATE TABLE IF NOT EXISTS crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES crm_integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync details
  lead_list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
  total_leads INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Results
  status VARCHAR(20) CHECK (status IN ('success', 'partial', 'failed')),
  error_details JSONB, -- Array of errors: [{ lead_name, error_message }]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_integrations_user_id ON crm_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_integrations_provider ON crm_integrations(crm_provider);
CREATE INDEX IF NOT EXISTS idx_crm_integrations_active ON crm_integrations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_user_id ON crm_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_integration_id ON crm_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_created_at ON crm_sync_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_integrations
CREATE POLICY "Users can view their own CRM integrations"
  ON crm_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CRM integrations"
  ON crm_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM integrations"
  ON crm_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM integrations"
  ON crm_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for crm_sync_logs
CREATE POLICY "Users can view their own sync logs"
  ON crm_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON crm_sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crm_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_crm_integration_updated_at
  BEFORE UPDATE ON crm_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_integration_updated_at();

-- Comments for documentation
COMMENT ON TABLE crm_integrations IS 'Stores CRM integration credentials and configuration per user';
COMMENT ON TABLE crm_sync_logs IS 'Logs of lead synchronizations to CRM systems';
COMMENT ON COLUMN crm_integrations.crm_provider IS 'CRM provider name: kommo, hubspot, rdstation, pipedrive, etc';
COMMENT ON COLUMN crm_integrations.crm_config IS 'JSON configuration specific to each CRM provider';
COMMENT ON COLUMN crm_sync_logs.error_details IS 'JSON array of error details for failed lead syncs';
