import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://klmwjwwkyjsmtjycuiaf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbXdqd3dreWpzbXRqeWN1aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzQ0NjAsImV4cCI6MjA2NjUxMDQ2MH0.mBOGM54w898iLxRWrsKtFLN7c1RbA92nTbuo2nM9MGo'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})