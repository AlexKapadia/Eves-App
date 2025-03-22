import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, updateUserData, logout } = useAuth();
  const [formState, setFormState] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    experienceLevel: user?.experienceLevel || '',
    profileImage: user?.profileImage || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // If not logged in and not loading, redirect to login
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (user) {
      // Update form state when user data loads
      setFormState({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        experienceLevel: user.experienceLevel || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [isLoading, isAuthenticated, navigate, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, experienceLevel: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      await updateUserData({
        name: formState.name,
        bio: formState.bio,
        location: formState.location,
        experienceLevel: formState.experienceLevel,
        profileImage: formState.profileImage,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Logout error",
        description: "There was an error logging out. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hiking-moss mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="bg-hiking-sky/10 p-6 border-b">
                <h1 className="text-2xl font-bold text-hiking-night">Your Profile</h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Profile Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image URL</Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    value={formState.profileImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-sm text-gray-500">Enter a URL for your profile picture</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formState.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself and your hiking journey"
                    rows={4}
                  />
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formState.location}
                    onChange={handleInputChange}
                    placeholder="City, State, Country"
                  />
                </div>
                
                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Hiking Experience Level</Label>
                  <Select 
                    value={formState.experienceLevel} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Your email cannot be changed</p>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
