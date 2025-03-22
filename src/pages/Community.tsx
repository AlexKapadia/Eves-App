import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreatePost from '@/components/community/CreatePost';
import PostItem from '@/components/community/PostItem';
import { Post, fetchPosts, validateSupabaseConnection } from '@/lib/community-service';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton component for loading state
const PostSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-4">
    <div className="flex items-center mb-3">
      <Skeleton className="h-10 w-10 rounded-full mr-3" />
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-40 w-full rounded-lg mb-4" />
    <div className="flex justify-between pt-2 border-t">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
);

const Community = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 5; // Reduced from 10 to improve initial load time

  const loadPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const newPage = reset ? 0 : page;
      const newPosts = await fetchPosts(sortBy, postsPerPage, newPage * postsPerPage);
      
      if (reset) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setPage(page + 1);
      }

      // If we got fewer posts than requested, we're at the end
      setHasMore(newPosts.length === postsPerPage);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error loading posts",
        description: "Could not load community posts. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, sortBy, toast]);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, [sortBy]);

  const handleSortChange = useCallback((newSortBy: 'latest' | 'popular') => {
    if (sortBy !== newSortBy) {
      setSortBy(newSortBy);
      // Posts will reload due to the useEffect dependency on sortBy
    }
  }, [sortBy]);

  const handlePostCreated = useCallback(() => {
    // Reload the latest posts when a new post is created
    loadPosts(true);
  }, [loadPosts]);

  const handleLikeUpdate = useCallback((postId: string, likesCount: number, isLiked: boolean) => {
    // Update the post in our local state
    setPosts(posts => posts.map(post => 
      post.id === postId ? { ...post, likes_count: likesCount } : post
    ));
  }, []);

  // Add debug function to check connection
  const handleTestConnection = useCallback(async () => {
    try {
      toast({
        title: "Testing database connection...",
        description: "Please wait while we check your connection",
      });
      
      const result = await validateSupabaseConnection();
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Your database connection is working properly",
        });
      } else {
        toast({
          title: "Connection failed",
          description: `Error: ${result.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-hiking-sky/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-hiking-night mb-6">Our Community</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with fellow hikers, share your adventures, and get inspired by stories from women around the world.
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Post creator */}
              <CreatePost onPostCreated={handlePostCreated} />
              
              {/* Community posts */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-hiking-night">Recent Posts</h2>
                  <div className="flex space-x-2">
                    <button 
                      className={`text-sm px-3 py-1 rounded-full ${
                        sortBy === 'latest' 
                          ? 'bg-hiking-moss text-white' 
                          : 'hover:bg-hiking-moss/10 text-hiking-night'
                      }`}
                      onClick={() => handleSortChange('latest')}
                      disabled={isLoading}
                    >
                      Latest
                    </button>
                    <button 
                      className={`text-sm px-3 py-1 rounded-full ${
                        sortBy === 'popular' 
                          ? 'bg-hiking-moss text-white' 
                          : 'hover:bg-hiking-moss/10 text-hiking-night'
                      }`}
                      onClick={() => handleSortChange('popular')}
                      disabled={isLoading}
                    >
                      Popular
                    </button>
                  </div>
                </div>
                
                {isLoading && posts.length === 0 ? (
                  <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 mb-4">No posts yet. Be the first to share your adventure!</p>
                    {!isAuthenticated && (
                      <p className="text-sm text-hiking-moss">
                        Please sign in to create a post
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {posts.map(post => (
                      <PostItem 
                        key={post.id} 
                        post={post} 
                        onLikeUpdate={handleLikeUpdate}
                      />
                    ))}
                    
                    <div className="text-center mt-8">
                      {hasMore ? (
                        <Button
                          onClick={() => loadPosts()}
                          disabled={isLoadingMore}
                          className="px-6 py-2 bg-hiking-stone/20 hover:bg-hiking-stone/30 text-hiking-night rounded-lg transition-colors"
                        >
                          {isLoadingMore ? 'Loading...' : 'Load More Posts'}
                        </Button>
                      ) : (
                        <p className="text-sm text-gray-500">No more posts to load</p>
                      )}
                    </div>
                  </>
                )}

                {/* Debug connection button */}
                <div className="mt-12 border-t pt-6 text-center">
                  <p className="text-xs text-gray-500 mb-2">Troubleshooting</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestConnection}
                    className="text-xs"
                  >
                    Test Database Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default React.memo(Community);
