import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useToast } from '@/components/ui/use-toast';
import { Session, User } from '@supabase/supabase-js';

// Our app's user type
interface AppUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  experienceLevel?: string;
  joinedDate?: Date;
  [key: string]: any;
}

// Auth context type
interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string, email: string, password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<AppUser>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Supabase user to our app user format
const supabaseUserToAppUser = async (supabaseUser: User): Promise<AppUser | null> => {
  if (!supabaseUser) return null;

  // Get profile data from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    
    // Create a profile if it doesn't exist
    if (error.code === 'PGRST116') { // Record not found
      const userName = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User';
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: supabaseUser.id,
          name: userName,
          email: supabaseUser.email,
          joined_date: new Date().toISOString()
        }]);
        
      if (insertError) {
        console.error('Error creating missing profile:', insertError);
      } else {
        console.log('Created missing profile for user:', supabaseUser.id);
        // Retry fetching the profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
          
        if (newProfile) {
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: newProfile.name || userName,
            profileImage: newProfile.profile_image || '',
            bio: newProfile.bio || '',
            location: newProfile.location || '',
            experienceLevel: newProfile.experience_level || '',
            joinedDate: newProfile.joined_date ? new Date(newProfile.joined_date) : new Date(),
          };
        }
      }
    }
  }

  // Return user with profile data if available
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    profileImage: profile?.profile_image || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    experienceLevel: profile?.experience_level || '',
    joinedDate: profile?.joined_date ? new Date(profile.joined_date) : new Date(),
  };
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Listen for auth changes - with optimization
  useEffect(() => {
    // Try to get cached user first for faster initial load
    const cachedUserJson = localStorage.getItem('cachedUser');
    if (cachedUserJson) {
      try {
        const cachedUser = JSON.parse(cachedUserJson);
        setUser(cachedUser);
        setIsLoading(false);
      } catch (e) {
        console.error('Error parsing cached user:', e);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Handle specific events
        if (event === 'SIGNED_OUT') {
          // Clear all auth-related storage
          setUser(null);
          setSession(null);
          localStorage.removeItem('cachedUser');
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase.auth.token');
          console.log('User signed out, cleared all local storage');
        } else {
          setSession(session);

          if (session?.user) {
            try {
              // Use cached conversion if available
              const appUser = await supabaseUserToAppUser(session.user);
              setUser(appUser);
              
              // Cache the user data
              if (appUser) {
                localStorage.setItem('cachedUser', JSON.stringify(appUser));
              }
            } catch (error) {
              console.error('Error transforming user:', error);
              setUser(null);
            }
          } else {
            setUser(null);
            localStorage.removeItem('cachedUser');
          }
        }
        
        setIsLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log("Found existing session for user:", data.session.user.id);
          setSession(data.session);
          
          const appUser = await supabaseUserToAppUser(data.session.user);
          setUser(appUser);
          
          // Cache the user data
          if (appUser) {
            localStorage.setItem('cachedUser', JSON.stringify(appUser));
          }
        } else {
          console.log("No existing session found");
          // Clean up any stale data
          localStorage.removeItem('cachedUser');
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function - with optimization
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Remember email for faster future logins
      localStorage.setItem('lastLoginEmail', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error from Supabase:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password"
        });
        throw error;
      }
      
      console.log("Direct Supabase login successful", data.user?.id);
      
      // Just return here - the auth state listener will update the user
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: { name: string, email: string, password: string }) => {
    try {
      setIsLoading(true);
      
      console.log('Starting registration with:', userData.email);
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });
      
      if (error) {
        console.error('Registration error from Supabase:', error);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message
        });
        throw error;
      }
      
      console.log('Supabase auth signup successful');
      
      // Profile creation will now happen directly in the SignUp component
      // and through the Auth state change handler
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!"
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with complete cleanup
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out user...');
      
      // First, clear all cached data
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('lastLoginEmail');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Force local state update first for immediate UI response
      setUser(null);
      setSession(null);
      
      // Then attempt signOut without waiting for it
      await supabase.auth.signOut().catch(error => {
        console.warn('Supabase signOut had issues:', error);
      });
      
      // Navigate to home page without a full reload
      window.location.href = '/';
      
      console.log('Logout completed');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Force navigation even if there's an error
      window.location.href = '/';
      
      toast({
        variant: "default",
        title: "Signed out",
        description: "You've been signed out."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data function
  const updateUserData = async (userData: Partial<AppUser>) => {
    if (!user || !user.id) {
      console.warn('Cannot update user data: No user is logged in');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          experience_level: userData.experienceLevel,
          profile_image: userData.profileImage,
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile in Supabase:', error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "There was an error updating your profile"
        });
        throw error;
      }
      
      // Update local user state and cache
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('cachedUser', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserData,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 