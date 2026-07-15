import { createClient } from "@supabase/supabase-js";

const projectID = import.meta.env.SUPABASE_PROJECT_ID;
const anonKey = import.meta.env.SUPABASE_ANON_KEY;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const validSupabaseConfig = projectID && anonKey && serviceRoleKey;

export const supabase = validSupabaseConfig ? createClient(`https://${projectID}.supabase.co`, anonKey) : null;
export const supabaseAdmin = validSupabaseConfig ? createClient(`https://${projectID}.supabase.co`, serviceRoleKey) : null;
