import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Post, PostComment, likePost, hasUserLikedPost, addComment, fetchComments, formatRelativeTime } from '@/lib/community-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PostItemProps {
  post: Post;
  onLikeUpdate?: (postId: string, likesCount: number, isLiked: boolean) => void;
}

const CommentItem = memo(({ comment }: { comment: PostComment }) => {
  return (
    <div className="flex space-x-3 mb-4 animate-fadeIn">
      <div className="h-8 w-8 rounded-full bg-hiking-sky/30 overflow-hidden flex-shrink-0">
        {comment.profile_image_url ? (
          <img src={comment.profile_image_url} alt={comment.author} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-hiking-moss text-white font-semibold">
            {comment.author ? comment.author.charAt(0) : '?'}
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="font-semibold text-sm text-hiking-night">{comment.author || 'Unknown'}</p>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
          <span>{formatRelativeTime(comment.created_at)}</span>
          <button className="hover:text-hiking-moss transition-colors">Like</button>
          <button className="hover:text-hiking-moss transition-colors">Reply</button>
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

const PostItem = memo(({ post, onLikeUpdate }: PostItemProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Check if user has liked the post on component mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (isAuthenticated && user) {
        const liked = await hasUserLikedPost(user.id, post.id);
        setIsLiked(liked);
      }
    };
    
    checkLikeStatus();
  }, [isAuthenticated, user, post.id]);

  // Expand image when clicked
  const toggleImageExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLikeAnimating(true);
      const liked = await likePost(user!.id, post.id);
      setIsLiked(liked);
      const newLikesCount = likesCount + (liked ? 1 : -1);
      setLikesCount(newLikesCount);
      
      // Notify parent component if callback provided
      if (onLikeUpdate) {
        onLikeUpdate(post.id, newLikesCount, liked);
      }
      
      setTimeout(() => {
        setIsLikeAnimating(false);
      }, 1000);
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Action failed",
        description: "Could not like the post. Please try again.",
        variant: "destructive"
      });
      setIsLikeAnimating(false);
    }
  }, [isAuthenticated, user, post.id, likesCount, onLikeUpdate, toast]);

  const handleShowComments = useCallback(async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    // If we have already loaded comments once, just show them without fetching again
    if (commentsLoaded) {
      setShowComments(true);
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
      return;
    }

    setIsLoadingComments(true);
    try {
      const postComments = await fetchComments(post.id);
      setComments(postComments);
      setShowComments(true);
      setCommentsLoaded(true);
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Could not load comments",
        description: "There was an error loading comments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingComments(false);
    }
  }, [showComments, commentsLoaded, post.id, toast]);

  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await addComment(user!.id, post.id, newComment);
      // Add the new comment at the top
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
      setCommentsCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Comment failed",
        description: "Could not post your comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  }, [isAuthenticated, user, post.id, newComment, toast]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 transition-shadow hover:shadow-lg">
      <div className="p-4">
        {/* Post header */}
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-hiking-sky/30 overflow-hidden mr-3">
            {post.profile_image_url ? (
              <img 
                src={post.profile_image_url} 
                alt={post.author} 
                className="h-full w-full object-cover" 
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-hiking-moss text-white font-semibold">
                {post.author ? post.author.charAt(0) : '?'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-hiking-night">{post.author || 'Unknown User'}</h3>
            <p className="text-xs text-gray-500">{formatRelativeTime(post.created_at)}</p>
          </div>
          <div className="ml-auto">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Post title */}
        {post.title && <h4 className="font-medium text-lg mb-2 text-hiking-night">{post.title}</h4>}
        
        {/* Post content */}
        <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>
        
        {/* Post image */}
        {post.image_url && (
          <div 
            className={`rounded-lg overflow-hidden mb-4 cursor-pointer transition-all ${isExpanded ? 'max-h-screen' : 'max-h-96'}`}
            onClick={toggleImageExpand}
          >
            <img 
              src={post.image_url} 
              alt="Post attachment" 
              className={`w-full h-auto transition-transform duration-300 ${isExpanded ? 'hover:scale-[0.99]' : 'hover:scale-[1.01]'}`}
              loading="lazy"
            />
          </div>
        )}
        
        {/* Like/Comment count */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              {likesCount > 0 && (
                <div className="flex items-center">
                  <div className="bg-hiking-moss text-white rounded-full w-5 h-5 flex items-center justify-center mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  </div>
                  <span>{likesCount}</span>
                </div>
              )}
            </div>
            <div>
              {commentsCount > 0 && (
                <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between text-sm text-gray-500 pt-3 border-t">
          <button 
            onClick={handleLike}
            className={`flex items-center justify-center space-x-1 transition-colors rounded-md py-1.5 px-3 flex-1 ${
              isLiked ? 'text-hiking-moss bg-hiking-moss/10 font-medium' : 'hover:bg-gray-100 hover:text-hiking-moss'
            }`}
            disabled={!isAuthenticated}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${isLikeAnimating ? 'scale-150' : ''}`}
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={isLiked ? 0 : 2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span>Like</span>
          </button>
          
          <button 
            onClick={handleShowComments}
            className="flex items-center justify-center space-x-1 hover:bg-gray-100 hover:text-hiking-sky transition-colors rounded-md py-1.5 px-3 flex-1"
            disabled={isLoadingComments}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <span>
              {isLoadingComments ? 'Loading...' : 'Comment'}
            </span>
          </button>
          
          <button className="flex items-center justify-center space-x-1 hover:bg-gray-100 hover:text-hiking-terracotta transition-colors rounded-md py-1.5 px-3 flex-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
              />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
      
      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-4 border-t"
          >
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="flex mb-4">
                <div className="h-8 w-8 rounded-full bg-hiking-sky/30 overflow-hidden mr-2 flex-shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-hiking-moss text-white font-semibold">
                      {user?.name ? user.name.charAt(0) : '?'}
                    </div>
                  )}
                </div>
                <div className="relative flex-1">
                  <Input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="pr-12 rounded-full bg-gray-100 border-gray-200"
                    disabled={isSubmittingComment}
                  />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hiking-moss"
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4 text-center">Please log in to comment</p>
            )}
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PostItem.displayName = 'PostItem';

export default PostItem; 