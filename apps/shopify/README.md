# The world's first LASZ Stack app

If you're reading this, you're probably interested in the LASZ Stack. This is a work in progress, but I'm excited to share it with you. The todo app is intelligent enough to detect if you have configued supabase and will automatically use it if it's available. If it's available you'll get a login button and your todos will be saved to your supabase account.

## Migrating the Supabase Schema

To migrate the TODO app schema to your supabase project, run `npx supabase db push`. You'll need to be logged into the supabase cli of course though. You can log in with `npx supabase login` and link your project with `supabase link --project-ref your-project-id`. So as long as you have the following environment variables set in your `.env` file, you should be good to go:

```bash
SUPABASE_PROJECT_ID=your_project_ref
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Have fun with building with an LASZ app!
