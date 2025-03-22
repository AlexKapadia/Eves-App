import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase'; // Import supabase client directly

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password"
      });
      return;
    }
    
    try {
      setIsLoggingIn(true);
      console.log("Attempting login with email:", email);
      
      // Use Supabase client directly instead of going through backend
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      
      // Save session information
      if (data.session) {
        localStorage.setItem('supabase.auth.token', data.session.access_token);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      
      // Reset auth context with the new session
      await login(email, password);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <a 
            href="/forgot-password" 
            className="text-sm text-hiking-sky hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <Input 
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'Signing in...' : 'Log In'}
      </Button>
    </form>
  );
}; 