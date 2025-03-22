import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Add animation styles to the document
const addAnimationStyles = () => {
  // Only add if not already present
  if (!document.querySelector('#community-animations')) {
    const style = document.createElement('style');
    style.id = 'community-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes heartBeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.3); }
        70% { transform: scale(1); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-heartBeat {
        animation: heartBeat 1.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
};

// Call this when the module is loaded
if (typeof window !== 'undefined') {
  addAnimationStyles();
}

// Types
export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author?: string;
  profile_image_url?: string;
  likes_count?: number;
  comments_count?: number;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: string;
  profile_image_url?: string;
}

export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: string;
}

// Check if user is authenticated
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Error in isUserAuthenticated:', error);
    return false;
  }
};

// Get the current user ID if authenticated
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.user.id;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    return null;
  }
};

// Fetch posts with author information and counts
export const fetchPosts = async (sortBy: 'latest' | 'popular' = 'latest', limit = 10, offset = 0) => {
  try {
    // Create a more efficient query with proper indexes
    let query = supabase
      .from('posts')
      .select(`
        id, user_id, title, content, image_url, created_at, updated_at,
        profiles:user_id (username, profile_image_url),
        post_likes:post_likes (count),
        post_comments:post_comments (count)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      // First by likes count (descending), then by creation date (descending)
      query = query.order('post_likes.count', { ascending: false, foreignTable: 'post_likes' })
                  .order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Transform the data to match the expected format
    return data.map((post: any) => ({
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: post.profiles?.username || 'Unknown User',
      profile_image_url: post.profiles?.profile_image_url || null,
      likes_count: post.post_likes?.length || 0,
      comments_count: post.post_comments?.length || 0
    }));
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    return [];
  }
};

// Enhanced createPost function
export const createPost = async (userId: string, content: string, imageUrl?: string, title?: string) => {
  try {
    // Verify user is still authenticated
    const isAuth = await isUserAuthenticated();
    if (!isAuth) {
      throw new Error('Authentication required to create posts');
    }
    
    console.log("Creating post with:", { userId, content: content.length > 50 ? content.substring(0, 50) + '...' : content, imageUrl: !!imageUrl, title });
    
    const postId = uuidv4();
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          id: postId,
          user_id: userId,
          content,
          image_url: imageUrl || null,
          title: title || null
        }
      ])
      .select();

    if (error) {
      console.error('Error creating post:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error('No data returned when creating post');
      throw new Error('No data returned when creating post');
    }

    console.log("Post created successfully:", data[0].id);
    return data[0];
  } catch (error) {
    console.error('Error in createPost:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Post creation failed: ${error.message}`);
    } else {
      throw new Error('Post creation failed due to an unknown error');
    }
  }
};

// Enhanced uploadPostImage function with better error handling and progress
export const uploadPostImage = async (userId: string, file: File, onProgress?: (progress: number) => void) => {
  try {
    // Verify user is still authenticated
    const isAuth = await isUserAuthenticated();
    if (!isAuth) {
      throw new Error('Authentication required to upload images');
    }
    
    // Validate file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, GIF or WebP image.');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File size exceeds 10MB limit');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Set up progress tracking manually if needed
    if (onProgress) {
      // Show initial progress
      onProgress(0);
      
      // Show intermediate progress while we're uploading
      const progressInterval = setInterval(() => {
        // Simulate progress between 10% and 90%
        const randomProgress = Math.floor(Math.random() * 30) + 30; 
        onProgress(randomProgress);
      }, 500);
      
      // Clean up interval after upload completes or fails
      setTimeout(() => clearInterval(progressInterval), 10000);
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    // Show upload complete
    if (onProgress) {
      onProgress(100);
    }

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadPostImage:', error);
    throw error;
  }
};

// Add a like to a post
export const likePost = async (userId: string, postId: string) => {
  try {
    // Add manual timeout to prevent hanging
    const requestTimeout = 5000; // 5 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Like operation timed out')), requestTimeout)
    );

    // Check if already liked
    const checkLikePromise = supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    const { data: existingLike, error: fetchError } = await Promise.race([
      checkLikePromise,
      timeoutPromise.then(() => ({ data: null, error: new Error('Timeout checking like status') }))
    ]) as any;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking like status:', fetchError);
      throw fetchError;
    }

    if (existingLike) {
      // User already liked this post, so we'll unlike it
      const unlikePromise = supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      const { error } = await Promise.race([
        unlikePromise,
        timeoutPromise.then(() => ({ error: new Error('Timeout removing like') }))
      ]) as any;
      
      if (error) {
        console.error('Error removing like:', error);
        throw error;
      }

      return false; // Indicate the post is now unliked
    } else {
      // Add a new like
      const likePromise = supabase
        .from('post_likes')
        .insert([{ user_id: userId, post_id: postId }]);

      const { error } = await Promise.race([
        likePromise,
        timeoutPromise.then(() => ({ error: new Error('Timeout adding like') }))
      ]) as any;
      
      if (error) {
        console.error('Error adding like:', error);
        throw error;
      }

      return true; // Indicate the post is now liked
    }
  } catch (error) {
    console.error('Error in likePost:', error);
    // Return the current state on error to prevent UI inconsistency
    return false;
  }
};

// Check if a user has liked a post
export const hasUserLikedPost = async (userId: string, postId: string) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      console.error('Error checking if user liked post:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasUserLikedPost:', error);
    return false;
  }
};

// Add a comment to a post
export const addComment = async (userId: string, postId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          post_id: postId,
          content
        }
      ])
      .select(`
        *,
        profiles:user_id (username, profile_image_url)
      `);

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    // Transform to expected format
    return {
      id: data[0].id,
      user_id: data[0].user_id,
      post_id: data[0].post_id,
      content: data[0].content,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      author: data[0].profiles?.username || 'Unknown User',
      profile_image_url: data[0].profiles?.profile_image_url || null
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    throw error;
  }
};

// Fetch comments for a post
export const fetchComments = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (username, profile_image_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    // Transform to expected format
    return data.map((comment: any) => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: comment.profiles?.username || 'Unknown User',
      profile_image_url: comment.profiles?.profile_image_url || null
    }));
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return [];
  }
};

// Get counts of likes and comments for a post
export const getPostStats = async (postId: string) => {
  try {
    const { data: likesCount, error: likesError } = await supabase
      .from('post_likes')
      .select('count', { count: 'exact' })
      .eq('post_id', postId);

    const { data: commentsCount, error: commentsError } = await supabase
      .from('post_comments')
      .select('count', { count: 'exact' })
      .eq('post_id', postId);

    if (likesError || commentsError) {
      console.error('Error fetching post stats:', likesError || commentsError);
      return { likes: 0, comments: 0 };
    }

    return {
      likes: likesCount[0]?.count || 0,
      comments: commentsCount[0]?.count || 0
    };
  } catch (error) {
    console.error('Error in getPostStats:', error);
    return { likes: 0, comments: 0 };
  }
};

// Format timestamp into a human-readable relative time string
export const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsDiff < 60) {
    return 'just now';
  } else if (secondsDiff < 3600) {
    const minutes = Math.floor(secondsDiff / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (secondsDiff < 86400) {
    const hours = Math.floor(secondsDiff / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (secondsDiff < 604800) {
    const days = Math.floor(secondsDiff / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Check if Supabase connection is working properly
export const validateSupabaseConnection = async () => {
  try {
    console.log("Validating Supabase connection...");
    const { data, error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("Supabase connection error:", error);
      return {
        success: false, 
        error: error.message,
        details: error
      };
    }
    
    console.log("Supabase connection successful");
    return { success: true };
  } catch (error) {
    console.error("Failed to validate Supabase connection:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    };
  }
};

// Add initialization check at the top
(async () => {
  console.log("Initializing community service...");
  const connectionStatus = await validateSupabaseConnection();
  if (!connectionStatus.success) {
    console.error("❌ FATAL: Failed to connect to Supabase database:", connectionStatus.error);
  } else {
    console.log("✅ Successfully connected to Supabase database");
  }
})(); 