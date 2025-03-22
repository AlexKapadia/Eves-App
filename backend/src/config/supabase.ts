import { createClient } from '@supabase/supabase-js';
import config from './index';

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        
        return fetch(url, {
          ...options,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      }
    }
  }
);

// Test Supabase connection
const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const start = Date.now();
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    } 
    
    console.log(`✅ Supabase connection successful (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed with exception:', error);
    return false;
  }
};

export { supabase, testSupabaseConnection }; 