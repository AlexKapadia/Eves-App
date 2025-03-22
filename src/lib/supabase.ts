import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nijnwsqpjcbmzydshzbm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pam53c3FwamNibXp5ZHNoemJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzM4ODcsImV4cCI6MjA1ODIwOTg4N30.MTqEjLfVvp0WxXNYmLYcjdHzRpZRvak7eY6Zrl4db8A';

// Debug constants
const DEBUG_SUPABASE = true;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 30000; // ms
const SESSION_MONITOR_INTERVAL = 2 * 60 * 1000; // 2 minutes

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing or invalid. Please check your environment variables.');
}

if (DEBUG_SUPABASE) {
  console.log('Initializing Supabase client with URL:', supabaseUrl);
}

// Retry logic for fetch operations
const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  // Set a timeout to avoid hanging requests
  const controller = new AbortController();
  const signal = controller.signal;
  
  const timeout = setTimeout(() => {
    controller.abort();
    console.warn(`Supabase request timed out after ${REQUEST_TIMEOUT/1000} seconds`);
  }, REQUEST_TIMEOUT);

  try {
    return await fetch(url, { ...options, signal })
      .finally(() => clearTimeout(timeout));
  } catch (err) {
    if (retries <= 0) throw err;
    
    console.warn(`Retrying failed request to ${url}, ${retries} retries left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 1.5);
  }
};

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url, options) => fetchWithRetry(url, options)
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
  }
});

// Session state and monitoring
let lastSessionCheck = 0;
let sessionMonitorInterval: number | null = null;
let isRefreshingToken = false;
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Start session monitoring
const startSessionMonitoring = () => {
  if (sessionMonitorInterval) {
    clearInterval(sessionMonitorInterval);
  }
  
  // Set up interval for checking session health
  sessionMonitorInterval = window.setInterval(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If session exists but is close to expiry, refresh it
        const expiresAt = new Date(data.session.expires_at || '').getTime();
        const timeToExpiry = expiresAt - Date.now();
        
        // If token expires in less than 5 minutes, refresh it
        if (timeToExpiry < 5 * 60 * 1000 && !isRefreshingToken) {
          refreshSession();
        }
      } else {
        // Clean up monitoring if session no longer exists
        stopSessionMonitoring();
      }
    } catch (error) {
      console.error('Error in session monitoring:', error);
    }
  }, SESSION_MONITOR_INTERVAL);
  
  // Also add event listeners for page visibility changes to ensure immediate refresh when needed
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  if (DEBUG_SUPABASE) console.log('Session monitoring started');
};

// Stop session monitoring
const stopSessionMonitoring = () => {
  if (sessionMonitorInterval) {
    clearInterval(sessionMonitorInterval);
    sessionMonitorInterval = null;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (DEBUG_SUPABASE) console.log('Session monitoring stopped');
  }
};

// Handle page visibility changes (refresh token when user comes back to the app after being away)
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const expiresAt = new Date(data.session.expires_at || '').getTime();
      const timeToExpiry = expiresAt - Date.now();
      
      // If token expires soon or we've been hidden for a while, refresh
      if (timeToExpiry < 30 * 60 * 1000 && !isRefreshingToken) { // 30 minutes
        refreshSession();
      }
    }
  }
};

// Refresh the session token
const refreshSession = async (): Promise<{ session: Session | null; error: any }> => {
  try {
    isRefreshingToken = true;
    if (DEBUG_SUPABASE) console.log('Refreshing session token');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      // If refresh fails, try to get session to check if it's still valid
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Session is truly invalid, clean up
        stopSessionMonitoring();
        localStorage.removeItem('cachedUser');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        
        // Force reload to clear all state
        window.location.reload();
      }
      return { session: null, error };
    } else if (data.session) {
      if (DEBUG_SUPABASE) console.log('Session refreshed successfully, expires:', data.session.expires_at);
      return { session: data.session, error: null };
    }
    
    return { session: null, error: null };
  } catch (error) {
    console.error('Exception during token refresh:', error);
    return { session: null, error };
  } finally {
    isRefreshingToken = false;
  }
};

// Advanced session check with auto-refresh
export const getSessionWithRefresh = async () => {
  try {
    const now = Date.now();
    // Only check session after interval has passed (prevents excessive checks)
    if (now - lastSessionCheck > SESSION_CHECK_INTERVAL) {
      lastSessionCheck = now;
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error retrieving session:', error.message);
        return { session: null, error };
      }
      
      if (data.session) {
        // If session exists but is close to expiry, refresh it
        const expiresAt = new Date(data.session.expires_at || '').getTime();
        const timeToExpiry = expiresAt - now;
        
        // If token expires in less than 5 minutes, refresh it
        if (timeToExpiry < 5 * 60 * 1000 && !isRefreshingToken) {
          return refreshSession();
        }
        
        // Start session monitoring if we have a valid session
        startSessionMonitoring();
      } else {
        stopSessionMonitoring();
      }
      
      return { session: data.session, error: null };
    } else {
      // Just get the session without validation to avoid excessive calls
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        startSessionMonitoring();
      }
      return { session: data.session, error: null };
    }
  } catch (error) {
    console.error('Error in getSessionWithRefresh:', error);
    return { session: null, error };
  }
};

// Helper function to check if a user is logged in (cached version)
export const isLoggedIn = async () => {
  try {
    const { session } = await getSessionWithRefresh();
    return !!session;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Setup auth state change listener to manage session monitoring
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    startSessionMonitoring();
  } else if (event === 'SIGNED_OUT') {
    stopSessionMonitoring();
  }
});

// Helper to create a post using the secure transaction function
export const createPostSecurely = async (
  userId: string, 
  content: string, 
  imageUrl?: string, 
  title?: string
) => {
  // First check session validity
  const { session, error: sessionError } = await getSessionWithRefresh();
  if (sessionError || !session) {
    throw new Error('Authentication required to create a post');
  }
  
  try {
    // Use the secure RPC function we created in SQL
    const { data, error } = await supabase.rpc('create_post_with_image', {
      user_id: userId,
      content,
      image_url: imageUrl || null,
      title: title || null
    });
    
    if (error) throw error;
    return data; // This is the new post ID
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Helper to safely fetch user profile with retries
export const getUserProfile = async (userId: string) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (i === MAX_RETRIES - 1) throw error;
        await new Promise(r => setTimeout(r, RETRY_DELAY * Math.pow(1.5, i)));
        continue;
      }
      
      return data;
    } catch (err) {
      if (i === MAX_RETRIES - 1) throw err;
    }
  }
  throw new Error('Failed to fetch user profile after multiple retries');
};

// Test the Supabase connection on initialization
(async () => {
  try {
    if (DEBUG_SUPABASE) console.log('Testing Supabase connection...');
    const start = Date.now();
    const { data, error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log(`✅ Supabase connection successful (${Date.now() - start}ms)`);
      
      // Run a quick validation on the setup
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        try {
          const { data: setupData } = await supabase.rpc('check_user_setup', { 
            user_uuid: sessionData.session.user.id 
          });
          if (setupData) {
            console.log('User setup validation:', setupData);
          }
        } catch (err) {
          console.warn('Setup validation not available yet:', err);
        }
      }
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed with exception:', error);
  }
})();

// Export default for convenience
export default supabase; 