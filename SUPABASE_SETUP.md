# Supabase Setup Instructions

This document guides you through setting up Supabase for this application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project from the dashboard
3. Choose a name and a strong password for your database
4. Select a region closest to your users
5. Wait for your database to be provisioned (this can take a few minutes)

## 2. Get Your API Keys

Once your project is ready:

1. In your Supabase project dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the sidebar
3. Find the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public** key: This is your `VITE_SUPABASE_ANON_KEY`

## 3. Configure Environment Variables

1. Copy the `.env.local` file from the project root to your local environment
2. Update the values with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. Set Up Database Schema

You can set up the database schema in two ways:

### Option 1: Using the SQL Editor

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/01_initial_schema.sql`
4. Click **Run** to execute the SQL script

### Option 2: Using Supabase CLI (Advanced)

If you prefer to use the CLI for migrations:

1. Install the Supabase CLI: `npm install -g supabase`
2. Log in to Supabase: `supabase login`
3. Initialize your project: `supabase init`
4. Link your project: `supabase link --project-ref your-project-reference`
5. Push your migrations: `supabase db push`

## 5. Configure Authentication

1. In your Supabase project dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure password policy and other settings as needed
4. Optional: Set up other providers like Google, GitHub, etc.

## 6. Row-Level Security (RLS)

The SQL migrations already set up Row-Level Security policies. However, ensure these are working correctly:

1. Go to **Authentication** → **Policies**
2. Verify that all tables have RLS enabled
3. Check that the policies for each table are set up correctly

## 7. Email Confirmation Settings

1. In **Authentication** → **Email Templates**, customize the templates if needed
2. In **Authentication** → **Settings**, decide whether to require email confirmation

## 8. Testing the Setup

1. Start your application
2. Try to register a new user
3. Verify the user appears in Supabase under **Authentication** → **Users**
4. Test login functionality
5. Verify profile data is saved correctly to the profiles table

## Troubleshooting

- **Authentication issues**: Check browser console for errors related to Supabase authentication
- **Database errors**: Check Network tab in DevTools for API responses from Supabase
- **CORS issues**: Ensure your site URL is added to the allowed origins in Supabase project settings

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 