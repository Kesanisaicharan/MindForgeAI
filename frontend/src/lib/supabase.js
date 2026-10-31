import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.warn('Supabase URL is missing or placeholder. Set VITE_SUPABASE_URL in the environment.');
}
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseKey || supabaseKey.includes('placeholder')) {
    console.warn('Supabase anon key is missing or placeholder. Set VITE_SUPABASE_ANON_KEY in the environment.');
}


export const supabase = createClient(supabaseUrl, supabaseKey)
