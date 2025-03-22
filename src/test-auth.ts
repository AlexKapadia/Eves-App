// Test file to verify auth and post creation
import { supabase, getSessionWithRefresh, createPostSecurely } from './lib/supabase';

// Function to test auth state and session
export const testAuthState = async () => {
  console.log('🔍 Testing auth state...');
  
  try {
    // Check session
    const { session, error } = await getSessionWithRefresh();
    
    if (error) {
      console.error('❌ Session error:', error);
      return { success: false, error };
    }
    
    if (!session) {
      console.log('⚠️ No active session found');
      return { success: false, message: 'No active session' };
    }
    
    console.log('✅ Valid session found for user:', session.user.id);
    console.log('📅 Session expires:', new Date(session.expires_at || '').toLocaleString());
    
    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return { success: false, error: profileError };
    }
    
    console.log('✅ Profile found:', profile.name);
    
    return { 
      success: true, 
      session, 
      profile,
      userId: session.user.id 
    };
  } catch (error) {
    console.error('❌ Auth test error:', error);
    return { success: false, error };
  }
};

// Function to test post creation
export const testPostCreation = async () => {
  console.log('🔍 Testing post creation...');
  
  try {
    // First check if logged in
    const authState = await testAuthState();
    
    if (!authState.success) {
      console.error('❌ Auth validation failed, cannot test post creation');
      return { success: false, message: 'Auth validation failed' };
    }
    
    // Try to create a test post
    const testPostId = await createPostSecurely(
      authState.userId,
      'This is a test post from the diagnostic tool',
      null,
      'Test Post'
    );
    
    console.log('✅ Test post created with ID:', testPostId);
    
    // Verify the post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', testPostId)
      .single();
      
    if (postError) {
      console.error('❌ Post verification error:', postError);
      return { success: false, error: postError };
    }
    
    console.log('✅ Post verified in database:', post.id);
    return { success: true, postId: testPostId };
  } catch (error) {
    console.error('❌ Post creation test error:', error);
    return { success: false, error };
  }
};

// Function to test logout
export const testLogout = async () => {
  console.log('🔍 Testing logout functionality...');
  
  try {
    // First check current session
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      console.log('⚠️ No session to logout from');
      return { success: true, message: 'No active session' };
    }
    
    // Store user ID for verification
    const userId = data.session.user.id;
    
    // Clear all related storage before logout
    localStorage.removeItem('cachedUser');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Attempt logout
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error };
    }
    
    // Verify session is gone
    const { data: newSession } = await supabase.auth.getSession();
    
    if (newSession.session) {
      console.error('❌ Session still exists after logout!');
      return { success: false, message: 'Session persisted after logout' };
    }
    
    console.log('✅ Successfully logged out user:', userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Logout test error:', error);
    return { success: false, error };
  }
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Add a button to the document to run tests
  const runTests = () => {
    console.log('🧪 Running auth and post tests...');
    
    // Chain tests
    testAuthState()
      .then(authResult => {
        if (authResult.success) {
          return testPostCreation().then(postResult => {
            return { authResult, postResult };
          });
        } else {
          console.log('⏭️ Skipping post test due to auth failure');
          return { authResult, postResult: { success: false } };
        }
      })
      .then(results => {
        console.log('📋 Test summary:');
        console.log(`Auth test: ${results.authResult.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Post test: ${results.postResult.success ? '✅ PASSED' : '❌ FAILED'}`);
      });
  };
  
  // Add to window for browser console access
  (window as any).testAuth = testAuthState;
  (window as any).testPost = testPostCreation;
  (window as any).testLogout = testLogout;
  (window as any).runAuthTests = runTests;
  
  console.log('Auth test utilities loaded. Run tests with:');
  console.log('• testAuth() - Test authentication');
  console.log('• testPost() - Test post creation');
  console.log('• testLogout() - Test logout');
  console.log('• runAuthTests() - Run all tests');
} 