import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { uploadPostImage } from '@/lib/community-service';
import { createPostSecurely } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    if (isAuthenticated) {
      setIsExpanded(true);
    } else {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, toast]);

  const handleCancel = useCallback(() => {
    setIsExpanded(false);
    setContent('');
    setTitle('');
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some text to your post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const progressInterval = simulateProgress();
    
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        setImageUploading(true);
        try {
          imageUrl = await uploadPostImage(user.id, selectedImage, (progress) => {
            // Update progress with actual upload progress
            setProgress(progress);
          });
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast({
            title: "Image upload failed",
            description: imageError instanceof Error ? imageError.message : "Could not upload image. Please try again or use a different image.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          setImageUploading(false);
          clearInterval(progressInterval);
          setProgress(0);
          return;
        }
        setImageUploading(false);
      }
      
      // Create the post using the secure function
      try {
        // Use our new secure function for reliable post creation
        const newPostId = await createPostSecurely(
          user.id,
          content,
          imageUrl,
          title || undefined
        );
        
        // Wait a brief moment for the post to be properly committed
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reset form and notify parent
        setContent('');
        setTitle('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsExpanded(false);
        setProgress(100);
        
        setTimeout(() => {
          onPostCreated();
          setProgress(0);
          toast({
            title: "Success!",
            description: "Your post has been published",
          });
        }, 500);
      } catch (postError) {
        console.error('Error creating post:', postError);
        
        // Check for specific error types
        let errorMessage = "Could not create your post. Please try again.";
        
        if (postError instanceof Error) {
          if (postError.message.includes('Authentication')) {
            errorMessage = "Your login session has expired. Please log in again.";
            // Force refresh to get a new session
            setTimeout(() => window.location.reload(), 2000);
          } else if (postError.message.includes('permission')) {
            errorMessage = "You don't have permission to post. Please log out and back in.";
          } else {
            errorMessage = `Error: ${postError.message}`;
          }
        }
        
        toast({
          title: "Post failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in post creation process:', error);
      // Toast notification already displayed in inner catch blocks
    } finally {
      setIsSubmitting(false);
      setImageUploading(false);
      clearInterval(progressInterval);
    }
  };

  const isUploading = isSubmitting || imageUploading;
  const buttonDisabled = !content.trim() || isUploading;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-hiking-sand flex items-center justify-center text-hiking-night font-semibold">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name ? user.name.charAt(0).toUpperCase() : 'G'
          )}
        </div>
        <div className="flex-grow">
          {!isExpanded ? (
            <div
              onClick={handleFocus}
              className="bg-gray-100 rounded-full px-4 py-3 cursor-text hover:bg-gray-200 transition-colors text-gray-600"
            >
              What's on your mind, {user?.name?.split(' ')[0] || 'hiker'}?
            </div>
          ) : (
            <Textarea
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'hiker'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isUploading}
              className="resize-none h-24 rounded-lg px-3 py-2 border-gray-200 focus:border-hiking-moss"
              autoFocus
            />
          )}
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Add a title (optional)</Label>
            <Input
              id="title"
              placeholder="Add a title to your post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="border-gray-200"
            />
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="rounded-lg object-cover max-h-[300px] w-auto mx-auto" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-hiking-night/70 text-white rounded-full p-1"
                aria-label="Remove image"
                disabled={isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <div className={`border border-dashed rounded-lg p-4 ${isExpanded ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Add to your post</p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors text-hiking-terracotta"
                  disabled={isUploading}
                  aria-label="Add image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors text-hiking-sky"
                  disabled={isUploading}
                  aria-label="Add location"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors text-hiking-moss"
                  disabled={isUploading}
                  aria-label="Tag people"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </div>
          
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
              <div className="bg-hiking-moss h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={buttonDisabled}
              className="bg-hiking-moss hover:bg-hiking-moss/90 text-white"
            >
              {isSubmitting 
                ? (imageUploading 
                  ? 'Uploading image...' 
                  : 'Publishing post...') 
                : 'Post'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default React.memo(CreatePost); 