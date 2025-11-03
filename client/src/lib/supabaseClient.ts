import { createClient } from '@supabase/supabase-js';

// Supabase configuration - HARDCODED FOR IMMEDIATE FIX
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmggvdulobhxlgdpbpom.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2d2ZHVsb2JoeGxnZHBicG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTAzNDMsImV4cCI6MjA2ODQyNjM0M30.Wfykg2Up3lRLFz66keUSQsGymjrFaJ9PIizwZz8H2i4';

// Debug environment variables
console.log('🔍 Debug Supabase Config:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
console.log('All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

// Hard fail with clear message if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
