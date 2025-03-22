import { supabase } from './supabase';

// Profile types
export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  bio?: string;
  location?: string;
  experience_level?: string;
  joined_date?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  location_coordinates?: { lat: number; lng: number };
  image?: string;
  distance?: string;
  difficulty?: string;
  total_spots?: number;
  booked_spots?: number;
  price?: number;
  organizer_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
}

// Profile operations
export const profileOperations = {
  // Get a user profile by ID
  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  // Update a user profile
  updateProfile: async (userId: string, profileData: Partial<Profile>): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  }
};

// Event operations
export const eventOperations = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data || [];
  },

  // Get an event by ID
  getEvent: async (eventId: string): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  },

  // Create a new event
  createEvent: async (eventData: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data;
  },

  // Update an event
  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
    const { error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      return false;
    }

    return true;
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }
};

// Post operations
export const postOperations = {
  // Get all posts
  getPosts: async (): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(name, profile_image)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  },

  // Get a post by ID
  getPost: async (postId: string): Promise<Post | null> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(name, profile_image)')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    return data;
  },

  // Create a new post
  createPost: async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post | null> => {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return data;
  },

  // Update a post
  updatePost: async (postId: string, postData: Partial<Post>): Promise<boolean> => {
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...postData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('posts')
      .update(dataWithTimestamp)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      return false;
    }

    return true;
  },

  // Delete a post
  deletePost: async (postId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  }
};

// Export all operations in a single object
export const db = {
  profiles: profileOperations,
  events: eventOperations,
  posts: postOperations
};

export default db; 