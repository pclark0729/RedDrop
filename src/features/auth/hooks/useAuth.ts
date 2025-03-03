import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { User, SignUpCredentials, SignInCredentials, ProfileUpdateData } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const newUser = await authService.signUp(credentials);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign up');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.signIn(credentials);
      setUser(user);
      return user;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign out');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset password');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.updatePassword(password);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update password');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: ProfileUpdateData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.uploadAvatar(file);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload avatar');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
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
};

export default useAuth; 