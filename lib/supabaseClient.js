import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const globalAny = globalThis;

if (!globalAny.supabaseClient) {
  globalAny.supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = globalAny.supabaseClient;
