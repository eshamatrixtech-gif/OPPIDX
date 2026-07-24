// Neutral re-export of the single Supabase client Mayatara already uses —
// deliberately NOT a second createClient() call. Two independently-created
// clients pointed at the same project would each run their own GoTrueClient
// with its own auto-refresh timer, which supabase-js explicitly warns
// against ("Multiple GoTrueClient instances detected"). This just gives
// oppidx-side (non-Mayatara-branded) code a neutral import path onto the
// exact same identity provider.
export { supabase, supabaseAdmin } from './mayatara/supabase'
