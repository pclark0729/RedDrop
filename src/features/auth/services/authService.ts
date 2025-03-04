import { AuthError, AuthResponse, User, UserResponse } from '@supabase/supabase-js';
import supabase from '../../../app/supabase';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  error: Error | null;
  user?: AuthUser | null;
}

export interface AvatarResponse extends AuthResponse {
  avatarUrl: string | null;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, firstName, lastName }: SignUpCredentials): Promise<AuthResponse> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // If user was created successfully, update their profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null, user: data.user ? this.formatUser(data.user) : null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      console.log('AuthService: Signing out user');
      
      // Clear any session storage
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          // Clear auth-related items
          sessionStorage.removeItem('auth_success');
          sessionStorage.removeItem('auth_complete');
          sessionStorage.removeItem('profile_fetch_pending');
          sessionStorage.removeItem('profile_fetch_error');
          sessionStorage.removeItem('needs_onboarding');
          sessionStorage.removeItem('rls_policy_error');
          sessionStorage.removeItem('user_email');
          console.log('AuthService: Cleared session storage');
        }
      } catch (storageError) {
        console.warn('AuthService: Failed to clear session storage:', storageError);
      }
      
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthService: Supabase sign out error:', error);
        throw error;
      }
      
      console.log('AuthService: Successfully signed out');
      return { error: null };
    } catch (error) {
      console.error('AuthService: Error signing out:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred during sign out') };
    }
  }

  /**
   * Get the current user with profile data
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;
      
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return this.formatUser(session.user, profile);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Send a password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Update the user's password
   */
  async updatePassword(password: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Update the user's profile
   */
  async updateProfile(profile: Partial<Omit<AuthUser, 'id' | 'email'>>): Promise<AuthResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No user logged in');
      }
      
      const updates = {
        id: session.user.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Upload an avatar image for the user
   */
  async uploadAvatar(file: File): Promise<AvatarResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No user logged in');
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);
      
      if (updateError) throw updateError;
      
      return { error: null, avatarUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
        avatarUrl: null
      };
    }
  }

  /**
   * Format user data from Supabase Auth and Profiles
   */
  private formatUser(user: any, profile?: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      avatarUrl: profile?.avatar_url || '',
      role: profile?.role || 'user',
      createdAt: profile?.created_at || user.created_at,
      updatedAt: profile?.updated_at || user.updated_at,
    };
  }
}

export const authService = new AuthService();
export default authService; 