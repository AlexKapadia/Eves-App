# Supabase Backend Fixes

This document explains the fixes implemented to address issues with the backend Supabase integration, particularly focusing on auth, image uploads, and post creation.

## Issues Addressed

1. **Auth and Profile Synchronization**
   - Missing or inconsistent profile creation when users sign up
   - Unreliable session state

2. **Image Upload Issues**
   - Inconsistent image uploads to Supabase Storage
   - Missing storage bucket policies
   - Incorrect URL storage in the database

3. **Post Creation Issues**
   - Mismatched schema between frontend and backend
   - Missing columns for post-related data
   - Incorrect RLS policies

4. **Additional Optimizations**
   - Expired token cleanup
   - Diagnostic views for troubleshooting
   - Performance indexing

## How to Apply the Fixes

1. Run the migration using the Supabase CLI:
   ```bash
   supabase db push
   ```
   
   Or apply the SQL directly in the Supabase dashboard SQL editor.

## Verification Steps

After applying the fixes, you should verify that everything is working correctly:

### 1. Auth & Profile Verification

```sql
-- Check if auth and profiles are in sync
SELECT * FROM user_account_status;

-- Fix any orphaned profiles
SELECT * FROM admin_fix_orphaned_profiles();
```

### 2. Storage Bucket Verification

```sql
-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'post-images';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### 3. Post Schema Verification

```sql
-- Check post table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts';

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'posts';
```

### 4. RLS Policy Verification

```sql
-- Check RLS policies for posts
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

### 5. End-to-End Tests

1. **Sign up a new user**: A profile should be automatically created
2. **Upload an image**: The upload should work and return a public URL
3. **Create a post with image**: The post should be successfully created
4. **Like a post**: The likes_count should increase
5. **Add a comment**: The comments_count should increase

## Comprehensive Setup Validation

Use the `check_user_setup` function to validate the entire setup for a user:

```sql
SELECT * FROM check_user_setup('your-user-uuid');
```

This will return JSON with validation results for all components.

## Troubleshooting

If issues persist:

1. Check the diagnostic views:
   ```sql
   SELECT * FROM storage_permissions_check;
   ```

2. Verify session persistence in your frontend code:
   ```typescript
   const { data, error } = await supabase.auth.getSession();
   console.log("Current session:", data.session);
   ```

3. Check for any constraint violations:
   ```sql
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

4. Examine storage logs for upload issues:
   ```sql
   SELECT * FROM storage.objects ORDER BY created_at DESC LIMIT 10;
   ``` 