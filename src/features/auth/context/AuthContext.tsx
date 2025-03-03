import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, authService } from '../services/authService';
import supabase from '../../../app/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<Omit<AuthUser, 'id' | 'email'>>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during sign up'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signIn({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during sign in'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during sign out'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during password reset'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.updatePassword(password);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err : new Error('An error occurred while updating password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<Omit<AuthUser, 'id' | 'email'>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.updateProfile(profile);
      if (error) throw error;
      
      // Refresh user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('An error occurred while updating profile'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { avatarUrl, error } = await authService.uploadAvatar(file);
      if (error) throw error;
      
      // Refresh user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err : new Error('An error occurred while uploading avatar'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 