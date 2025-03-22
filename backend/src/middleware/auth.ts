import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { mockDB } from '../config/db';
import { supabase } from '../config/supabase';

// Interface for JWT payload
interface JwtPayload {
  id: string;
}

// Extend Request interface in its own namespace and file
// This avoids the "All declarations of 'user' must have identical modifiers" error
declare namespace Express {
  export interface Request {
    user: any;
  }
}

// Middleware to protect routes that require authentication
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Not authorized, no token'
        });
        return;
      }

      // If using Supabase
      if (config.useSupabase) {
        // Validate the token with Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser(token);

        if (sessionError || !sessionData?.user) {
          res.status(401).json({
            success: false,
            error: 'Not authorized, invalid token'
          });
          return;
        }

        // Set user on request object
        req.user = sessionData.user;
        next();
        return;
      } 
      // Fallback to JWT verification
      else {
        try {
          // Using the same approach as in the controller
          const jwtSecret = config.jwtSecret || 'default-secret-key';
          const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

          // Find user from decoded token
          const user = mockDB.users.find(u => u.id === decoded.id);

          if (!user) {
            res.status(401).json({
              success: false,
              error: 'Not authorized, user not found'
            });
            return;
          }

          // Set user on request object
          req.user = user;
          next();
          return;
        } catch (error) {
          console.error('Error verifying token:', error);
          res.status(401).json({
            success: false,
            error: 'Not authorized, token failed'
          });
          return;
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
      return;
    }
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
    return;
  }
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden: admin access required',
    });
  }
}; 