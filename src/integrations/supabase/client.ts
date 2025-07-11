// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zrgzjwqaghrtkwrkngcq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZ3pqd3FhZ2hydGt3cmtuZ2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2OTg5ODQsImV4cCI6MjA2MjI3NDk4NH0.GcIGWtIYYBOa2soPXY5bFj9ZJRf1diJI32RUNND5-N4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});