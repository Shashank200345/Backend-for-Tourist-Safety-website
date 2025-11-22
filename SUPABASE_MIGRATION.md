# Supabase Migration Guide

This document outlines the migration from Prisma to Supabase.

## Changes Made

### 1. Package Dependencies
- ✅ Removed: `prisma`, `@prisma/client`
- ✅ Added: `@supabase/supabase-js`

### 2. Database Configuration
- ✅ Replaced `PrismaClient` with Supabase client in `backend/src/config/database.ts`
- ✅ Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables

### 3. Query Conversions

All Prisma queries have been converted to Supabase queries:

#### Table Name Mappings
- `User` → `users`
- `Session` → `sessions`
- `BlockchainRecord` → `blockchain_records`

#### Column Name Mappings (camelCase → snake_case)
- `touristId` → `tourist_id`
- `blockchainId` → `blockchain_id`
- `documentType` → `document_type`
- `documentNumber` → `document_number`
- `documentHash` → `document_hash`
- `itineraryStartDate` → `itinerary_start_date`
- `itineraryEndDate` → `itinerary_end_date`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `expiresAt` → `expires_at`
- `isActive` → `is_active`
- `lastAccessedAt` → `last_accessed_at`
- `transactionHash` → `transaction_hash`
- `blockNumber` → `block_number`
- `ipfsHash` → `ipfs_hash`

### 4. Files Modified
- ✅ `backend/src/config/database.ts` - Supabase client setup
- ✅ `backend/src/controllers/authController.ts` - User queries converted
- ✅ `backend/src/services/sessionService.ts` - Session queries converted
- ✅ `backend/src/services/blockchainService.ts` - Blockchain record queries converted
- ✅ `backend/package.json` - Dependencies updated
- ✅ `backend/README.md` - Documentation updated

### 5. New Files
- ✅ `backend/supabase/migrations/001_initial_schema.sql` - Database schema migration

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Supabase Project
1. Go to https://supabase.com and create a new project
2. Get your project URL and service role key from Settings → API

### 3. Environment Variables
Add to your `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `backend/supabase/migrations/001_initial_schema.sql`
3. Execute the SQL

Or use Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Key Differences from Prisma

### Error Handling
Supabase returns `{ data, error }` objects, so you need to check for errors:
```typescript
const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
if (error) {
  throw new Error(error.message);
}
```

### Single Record Queries
Use `.single()` for queries that should return one record:
```typescript
await supabase.from('users').select('*').eq('email', email).single();
```

### Updates
Updates require `.eq()` for the WHERE clause:
```typescript
await supabase.from('users').update({ name: 'New Name' }).eq('id', userId);
```

### Inserts
Inserts return the created record with `.select()`:
```typescript
const { data, error } = await supabase
  .from('users')
  .insert({ ... })
  .select()
  .single();
```

## Testing

After migration, test all endpoints:
- ✅ User registration
- ✅ Session creation
- ✅ Session verification
- ✅ Blockchain record creation
- ✅ Session expiration

## Notes

- The Prisma schema file (`backend/prisma/schema.prisma`) is kept for reference but is no longer used
- All foreign key relationships are preserved in the SQL migration
- Indexes are created for performance optimization
- The `updated_at` field is automatically updated via a database trigger

