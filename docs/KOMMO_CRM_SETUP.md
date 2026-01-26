# Kommo CRM Integration - Setup Guide

## 📋 Overview

This guide explains how to configure Kommo CRM integration for LeadBaze. This integration allows users to automatically sync leads from LeadBaze to their Kommo CRM account.

---

## 🔧 Backend Setup

### 1. Database Migration

The migration has been created at:
```
supabase/migrations/20260126_create_crm_integration_tables.sql
```

**To apply the migration:**

```bash
# Option 1: Via Supabase CLI
supabase db push

# Option 2: Manually in Supabase Dashboard
# Copy and paste the SQL from the migration file
```

This creates:
- `crm_integrations` table (stores OAuth credentials per user)
- `crm_sync_logs` table (tracks sync history)
- RLS policies (security)
- Indexes (performance)

### 2. Configure Kommo OAuth App

**For DVE Marketing (ce480f61-74a5-4ce7-bbab-3ee386f8f776):**

1. Log into Kommo account
2. Go to **Settings** → **Integrations** → **+ Create Integration**
3. Fill in:
   - **Name**: LeadBaze Integration
   - **Redirect URI**: `https://leadbaze.io/api/crm/callback`
   - **Scopes**: Select "Access to Contacts" and "Access to Leads"
4. Save and copy:
   - **Integration ID** (Client ID)
   - **Secret Key** (Client Secret)

### 3. Update Environment Variables

Edit `backend/config.env`:

```env
# Replace these values with actual Kommo credentials
KOMMO_CLIENT_ID=your_actual_client_id_from_kommo
KOMMO_CLIENT_SECRET=your_actual_client_secret_from_kommo
KOMMO_REDIRECT_URI=https://leadbaze.io/api/crm/callback
```

### 4. Get Kommo Custom Field IDs

Custom fields (phone, email, city) need to be mapped to Kommo field IDs.

**To find field IDs:**

```bash
# Use Kommo API to get account info
curl -X GET \
  'https://YOUR_SUBDOMAIN.kommo.com/api/v4/account' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Look for `custom_fields` in the response and note the IDs for:
- Phone field
- Email field
- City field (if exists)

**Example config:**
```json
{
  "field_mapping": {
    "phone": 123456,
    "email": 789012,
    "city": 345678
  },
  "subdomain": "dvemarketing"
}
```

---

## 🚀 Testing the Integration

### 1. Test Connection

```bash
# Test CRM connection endpoint
curl -X POST \
  'https://leadbaze.io/api/crm/test' \
  -H 'Content-Type: application/json' \
  -d '{
    "provider": "kommo"
  }'
```

Expected response:
```json
{
  "success": true,
  "connected": true
}
```

### 2. Test Lead Sync

```bash
# Sync leads to Kommo
curl -X POST \
  'https://leadbaze.io/api/crm/sync-leads' \
  -H 'Content-Type: application/json' \
  -d '{
    "leadListId": "uuid-of-lead-list",
    "provider": "kommo"
  }'
```

Expected response:
```json
{
  "success": true,
  "results": {
    "total": 10,
    "success_count": 10,
    "failed_count": 0,
    "errors": []
  }
}
```

---

## 📡 API Endpoints

### GET `/api/crm/providers`
Get list of supported CRM providers.

### GET `/api/crm/integrations`
Get user's active CRM integrations.

### POST `/api/crm/connect`
Connect a CRM using OAuth code.

**Body:**
```json
{
  "provider": "kommo",
  "authCode": "oauth_authorization_code",
  "config": {
    "subdomain": "dvemarketing",
    "field_mapping": {
      "phone": 123456,
      "email": 789012
    }
  }
}
```

### POST `/api/crm/test`
Test CRM connection.

**Body:**
```json
{
  "provider": "kommo"
}
```

### POST `/api/crm/sync-leads`
Sync leads from a list to CRM.

**Body:**
```json
{
  "leadListId": "uuid-of-lead-list",
  "provider": "kommo"
}
```

### DELETE `/api/crm/disconnect`
Disconnect CRM integration.

**Body:**
```json
{
  "provider": "kommo"
}
```

### GET `/api/crm/sync-history`
Get sync history.

**Query params:**
- `limit`: Number of records (default: 20)

---

## 🔒 Security Notes

1. **Tokens are encrypted:** Access tokens should be encrypted in production
2. **RLS enabled:** Row Level Security ensures users only see their own data
3. **OAuth 2.0:** Secure authentication flow
4. **Token refresh:** Automatic token refresh when expired

---

## 🐛 Troubleshooting

### "CRM integration not found"
- User hasn't connected their Kommo account yet
- Check `crm_integrations` table for user's entry

### "Failed to create contact in Kommo"
- Check field mapping configuration
- Verify custom field IDs are correct
- Check access token is valid

### "Token expired"
- Token refresh should happen automatically
- If fails, user needs to reconnect their Kommo account

---

## 📝 Next Steps (Frontend Implementation)

1. Create CRM settings page
2. Add "Connect Kommo" button with OAuth flow
3. Add "Send to CRM" button in lead lists
4. Show sync status and history
5. Display connection status indicator

---

## 🎯 For DVE Marketing

**User ID:** `ce480f61-74a5-4ce7-bbab-3ee386f8f776`

After Kommo OAuth app is configured:
1. User logs into LeadBaze
2. Goes to Settings → Integrations
3. Clicks "Connect Kommo"
4. Authorizes LeadBaze in Kommo OAuth popup
5. System saves tokens to `crm_integrations` table
6. User can now sync leads with one click!

---

## 📊 Monitoring

Check sync logs in database:
```sql
SELECT * FROM crm_sync_logs 
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776'
ORDER BY created_at DESC
LIMIT 10;
```

Check active integrations:
```sql
SELECT * FROM crm_integrations 
WHERE user_id = 'ce480f61-74a5-4ce7-bbab-3ee386f8f776' 
AND is_active = true;
```
