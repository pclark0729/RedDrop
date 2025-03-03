import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../../../app/supabase';

// Define user profile type
interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  blood_type?: string;
  phone_number?: string;
  address?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Define credentials types
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Define a comprehensive AuthContext type
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarding: boolean;
  error: Error | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          
          // Fetch user profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (profileError) throw profileError;
          
          if (profileData) {
            setUser(profileData as UserProfile);
            setIsOnboarding(!profileData.onboarding_completed);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        // Don't set error here to avoid showing error on initial load
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile when signed in
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!profileError && profileData) {
          setUser(profileData as UserProfile);
          setIsOnboarding(!profileData.onboarding_completed);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsOnboarding(false);
      }
    });
    
    // Clean up listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (credentials: SignInCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (signInError) throw signInError;
      
      if (data?.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setUser(profileData as UserProfile);
        setIsOnboarding(!profileData.onboarding_completed);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName || '',
            last_name: credentials.lastName || '',
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!data?.user) {
        throw new Error('User registration failed');
      }
      
      // Wait for the trigger function to create the profile
      // Add a small delay to ensure the database trigger has time to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the newly created profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile after signup:', profileError);
        // If we can't fetch the profile, we'll create a temporary user object
        const tempUser: UserProfile = {
          id: data.user.id,
          email: credentials.email,
          first_name: credentials.firstName || '',
          last_name: credentials.lastName || '',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(tempUser);
      } else {
        setUser(profileData as UserProfile);
      }
      
      setIsOnboarding(true);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) throw signOutError;
      
      setUser(null);
      setIsOnboarding(false);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Refresh user data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      setUser(profileData as UserProfile);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding function
  const completeOnboarding = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updates = {
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Refresh user data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      setUser(profileData as UserProfile);
      setIsOnboarding(false);
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err instanceof Error ? err : new Error('Failed to complete onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value
  const value = {
    user,
    isLoading,
    isOnboarding,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    completeOnboarding
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;