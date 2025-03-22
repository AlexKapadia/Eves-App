import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface ApiError extends Error {
  statusCode?: number;
  errors?: any;
  value?: string;
  path?: string;
  code?: number;
  keyValue?: Record<string, any>;
}

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors: { [key: string]: string } = {};

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    if (err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      errors[field] = `${field} already exists`;
    }
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler; 