import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import config from '../config';
import jwt from 'jsonwebtoken';
import { mockDB } from '../config/db';

// Define the JWT payload interface
interface JwtPayload {
  id: string;
}

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
      return;
    }

    // If using Supabase for auth
    if (config.useSupabase) {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (authError) {
        res.status(400).json({
          success: false,
          error: authError.message
        });
        return;
      }

      if (!authData.user) {
        res.status(400).json({
          success: false,
          error: 'Failed to create user'
        });
        return;
      }

      // Now create a profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            joined_date: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // We don't return error here as auth was successful
      }

      res.status(201).json({
        success: true,
        data: {
          id: authData.user.id,
          name,
          email
        }
      });
      return;
    } 
    
    // Fallback to mock database if not using Supabase
    else {
      // Check if user already exists
      const existingUser = mockDB.users.find(u => u.email === email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Create new user in mock DB
      const id = `user_${Date.now()}`;
      const newUser = {
        id,
        name,
        email,
        password, // In a real app, this would be hashed
        joined_date: new Date().toISOString()
      };

      mockDB.users.push(newUser);

      // Create token using a fixed string for testing
      // Note: In production, you should use a proper secret key
      const jwtSecret = config.jwtSecret || 'default-secret-key';  
      const payload: JwtPayload = { id: newUser.id };
      const token = jwt.sign(payload, jwtSecret);

      res.status(201).json({
        success: true,
        token,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
      return;
    }

    // If using Supabase for auth
    if (config.useSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      res.status(200).json({
        success: true,
        token: data.session.access_token,
        data: {
          id: data.user.id,
          name: profileData?.name || data.user.user_metadata.name || 'User',
          email: data.user.email
        }
      });
      return;
    } 
    
    // Fallback to mock database if not using Supabase
    else {
      // Find user in mock DB
      const user = mockDB.users.find(u => u.email === email && u.password === password);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Create token using a fixed string for testing
      const jwtSecret = config.jwtSecret || 'default-secret-key';
      const payload: JwtPayload = { id: user.id };
      const token = jwt.sign(payload, jwtSecret);

      res.status(200).json({
        success: true,
        token,
        data: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // The user should be attached to the request by the auth middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    // If using Supabase
    if (config.useSupabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data
      });
      return;
    } 
    
    // Fallback to mock database
    else {
      const user = mockDB.users.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Remove password from response
      const { password, ...userData } = user;

      res.status(200).json({
        success: true,
        data: userData
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}; 