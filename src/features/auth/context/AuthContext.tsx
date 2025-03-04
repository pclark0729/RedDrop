import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../../../app/supabase';
import { authService } from '../services/authService';

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
  signIn: (credentials: SignInCredentials) => Promise<UserProfile>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
}

// Create the context with default values
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  isOnboarding: false,
  error: null,
  signIn: async () => { 
    console.error('AuthContext not initialized');
    throw new Error('AuthContext not initialized');
  },
  signUp: async () => { console.error('AuthContext not initialized') },
  signOut: async () => { console.error('AuthContext not initialized') },
  updateProfile: async () => { console.error('AuthContext not initialized') },
  completeOnboarding: async () => { console.error('AuthContext not initialized') }
};

// Create the context with the default value
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Add a safe storage utility at the top of the file, after imports
const safeStorage = {
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`Failed to set sessionStorage item "${key}":`, error);
    }
  },
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Failed to get sessionStorage item "${key}":`, error);
    }
    return null;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove sessionStorage item "${key}":`, error);
    }
  }
};

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
        console.log('Checking for existing session...');
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          console.log('Found existing session, fetching profile...');
          const userId = sessionData.session.user.id;
          
          // Use the centralized function to fetch the profile
          const { profile, needsOnboarding, hasRlsError } = await fetchUserProfile(
            userId,
            sessionData.session.user.email || undefined
          );
          
          if (profile) {
            console.log('Profile fetched successfully:', profile);
            setUser(profile);
            setIsOnboarding(needsOnboarding);
            
            // Set session storage flags if needed
            if (hasRlsError) {
              sessionStorage.setRlsPolicyError(true);
            }
            
            sessionStorage.setNeedsOnboarding(needsOnboarding);
            
            console.log('Initial session check, onboarding status:', needsOnboarding ? 'Needs onboarding' : 'Onboarding completed');
          } else {
            console.log('No profile found for user');
          }
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Session check error:', err);
        // Don't set error here to avoid showing error on initial load
      } finally {
        setIsLoading(false);
        console.log('Session check completed');
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Auth state: SIGNED_IN, fetching profile...');
        
        try {
          // Check if we already have a sign-in in progress from the manual sign-in function
          if (sessionStorage.getSignInComplete()) {
            console.log('Manual sign-in already in progress, skipping auth listener profile fetch');
            return; // Skip duplicate profile fetch
          }
          
          // Use the centralized function to fetch the profile
          const { profile, needsOnboarding, hasRlsError } = await fetchUserProfile(
            session.user.id, 
            session.user.email || undefined
          );
          
          if (profile) {
            console.log('Auth state: Profile fetched successfully:', profile);
            setUser(profile);
          setIsOnboarding(needsOnboarding);
            
            // Set session storage flags if needed
            if (hasRlsError) {
              sessionStorage.setRlsPolicyError(true);
            }
            
            sessionStorage.setNeedsOnboarding(needsOnboarding);
          
          console.log('Auth state changed, onboarding status:', needsOnboarding ? 'Needs onboarding' : 'Onboarding completed');
        } else {
            console.error('Auth state: Failed to fetch profile');
          }
        } catch (err) {
          console.error('Auth state: Unexpected error during profile fetch:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth state: SIGNED_OUT, clearing user data');
        setUser(null);
        setIsOnboarding(false);
        
        // Clear any session storage flags
        sessionStorage.clearAuthFlags();
      }
    });
    
    // Clean up listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Add a direct check for onboarding status
  const checkOnboardingStatus = async (userId: string) => {
    console.log('Directly checking onboarding status for user:', userId);
    try {
      // Use the centralized function to fetch the profile
      const { profile, needsOnboarding, hasRlsError } = await fetchUserProfile(userId);
      
      if (!profile) {
        console.error('Direct onboarding check - Failed to fetch profile');
        return null;
      }
        
        // Update state
      setUser(profile);
        setIsOnboarding(needsOnboarding);
      
      // Set session storage flags if needed
      if (hasRlsError) {
        sessionStorage.setRlsPolicyError(true);
      }
      
      sessionStorage.setNeedsOnboarding(needsOnboarding);
        
        console.log('Direct onboarding check - Status:', needsOnboarding ? 'Needs onboarding' : 'Onboarding completed', {
          userId,
        onboardingCompleted: !needsOnboarding,
          needsOnboarding
        });
        
      return { user: profile, needsOnboarding };
    } catch (err) {
      console.error('Direct onboarding check - Error:', err);
      return null;
    }
  };

  // Centralized function to fetch user profile
  const fetchUserProfile = async (userId: string, userEmail?: string): Promise<{ 
    profile: UserProfile | null, 
    needsOnboarding: boolean, 
    hasRlsError: boolean 
  }> => {
    console.log('Fetching user profile for:', userId);
    
    // Set a flag in session storage to indicate profile fetch is in progress
    safeStorage.setItem('profile_fetch_pending', 'true');
    
    // Create a timeout promise
    const timeoutPromise = new Promise<{ 
      profile: UserProfile | null, 
      needsOnboarding: boolean, 
      hasRlsError: boolean 
    }>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Profile fetch timeout after 10 seconds'));
      }, 10000); // 10 second timeout
    });
    
    // Create the actual fetch promise
    const fetchPromise = (async () => {
      try {
        // Clear any previous errors
        safeStorage.removeItem('profile_fetch_error');
        
        if (!userId) {
          const errorMsg = 'Cannot fetch profile: User ID is missing';
          console.error(errorMsg);
          safeStorage.setItem('profile_fetch_error', errorMsg);
          safeStorage.setItem('profile_fetch_pending', 'false');
          return { profile: null, needsOnboarding: true, hasRlsError: false };
        }
        
        console.log('Making Supabase query to fetch profile for user:', userId);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        console.log('Supabase profile query completed', { 
          success: !profileError, 
          hasData: !!profileData 
        });
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          safeStorage.setItem('profile_fetch_error', JSON.stringify({
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          }));
          
          // Special handling for RLS policy error
          if (profileError.code === '42P17' && profileError.message.includes('infinite recursion detected in policy')) {
            console.warn('Detected RLS policy error (infinite recursion). Creating temporary profile and showing admin instructions.');
            safeStorage.setItem('rls_policy_error', 'true');
            
            // Log detailed information for debugging
            console.error('RLS Policy Error Details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              userId: userId
            });
            
            // Create a temporary profile
            const tempProfile: UserProfile = {
              id: userId,
              email: userEmail || safeStorage.getItem('user_email') || '',
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Store the error details for display to the user
            const errorDetails = {
              title: 'Database Policy Error',
              message: 'There is an issue with the database security policies. Please contact the administrator and mention "RLS infinite recursion error on profiles table".',
              technical: profileError.message,
              code: profileError.code,
              timestamp: new Date().toISOString()
            };
            
            safeStorage.setItem('rls_error_details', JSON.stringify(errorDetails));
            safeStorage.setItem('profile_fetch_pending', 'false');
            
            // Alert the console with fix instructions for developers
            console.info('%c RLS POLICY FIX REQUIRED', 'background: #ff0000; color: white; font-size: 16px; font-weight: bold; padding: 4px;');
            console.info('To fix this issue, run the SQL script "fix_rls_policy.sql" in your Supabase SQL editor.');
            console.info('The script will fix the infinite recursion in the RLS policies for the profiles table.');
            
            return { 
              profile: tempProfile, 
              needsOnboarding: true, 
              hasRlsError: true 
            };
          }
          
          // For other errors, create a default profile
          const defaultProfile: UserProfile = {
            id: userId,
            email: userEmail || safeStorage.getItem('user_email') || '',
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          safeStorage.setItem('profile_fetch_pending', 'false');
          safeStorage.setItem('needs_onboarding', 'true');
          return { 
            profile: defaultProfile, 
            needsOnboarding: true, 
            hasRlsError: false 
          };
        }
        
        if (profileData) {
          console.log('Profile data retrieved successfully:', {
            id: profileData.id,
            email: profileData.email,
            onboarding_completed: profileData.onboarding_completed
          });
          
          const needsOnboarding = !profileData.onboarding_completed;
          safeStorage.setItem('needs_onboarding', needsOnboarding ? 'true' : 'false');
          safeStorage.setItem('profile_fetch_pending', 'false');
          
          return { 
            profile: profileData as UserProfile, 
            needsOnboarding, 
            hasRlsError: false 
          };
        }
        
        console.warn('No profile data found for user:', userId);
        safeStorage.setItem('profile_fetch_pending', 'false');
        safeStorage.setItem('needs_onboarding', 'true');
        return { profile: null, needsOnboarding: true, hasRlsError: false };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching profile:', err);
        safeStorage.setItem('profile_fetch_error', errorMsg);
        safeStorage.setItem('profile_fetch_pending', 'false');
        safeStorage.setItem('needs_onboarding', 'true');
        return { profile: null, needsOnboarding: true, hasRlsError: false };
      }
    })();
    
    // Race the fetch against the timeout
    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error('Profile fetch failed with timeout or error:', error);
      safeStorage.setItem('profile_fetch_error', error instanceof Error ? error.message : 'Profile fetch failed');
      safeStorage.setItem('profile_fetch_pending', 'false');
      
      // Create a default profile on timeout
      const defaultProfile: UserProfile = {
        id: userId,
        email: userEmail || safeStorage.getItem('user_email') || '',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { 
        profile: defaultProfile, 
        needsOnboarding: true, 
        hasRlsError: false 
      };
    }
  };

  // Sign in function
  const signIn = async (credentials: SignInCredentials) => {
    console.log('Starting sign in process...');
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Store email temporarily for profile creation if needed
      safeStorage.setItem('user_email', credentials.email);
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (signInError) {
        console.error('Supabase sign in error:', signInError);
        throw signInError;
      }
      
      console.log('Supabase sign in successful, user ID:', data?.user?.id);
      
      if (!data?.user) {
        console.error('Sign-in successful but no user data returned');
        throw new Error('No user data returned from authentication');
      }
      
      // Store user ID and email in session storage
      sessionStorage.setAuthSuccess(data.user.id, credentials.email);
      
      // Set auth complete flag
      sessionStorage.setSignInComplete(true);
      
      // Log session storage state for debugging
      console.log('Session storage after sign-in:', {
        userId: sessionStorage.getUserId(),
        userEmail: sessionStorage.getUserEmail(),
        authSuccess: sessionStorage.getAuthSuccess(),
        signInComplete: sessionStorage.getSignInComplete()
      });
      
      // Create a basic user object to return immediately
      const basicUser: UserProfile = {
              id: data.user.id,
              email: credentials.email,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
      // Set the user in state
      setUser(basicUser);
      
      // Start profile fetch in the background
      safeStorage.setItem('profile_fetch_pending', 'true');
      fetchUserProfile(data.user.id, credentials.email)
        .then(({ profile, needsOnboarding }) => {
          if (profile) {
            setUser(profile);
            setIsOnboarding(needsOnboarding);
          }
        })
        .catch(err => {
          console.error('Background profile fetch error:', err);
        });
      
      return basicUser;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err as Error);
      throw err;
    } finally {
      console.log('Sign-in process completed, loading state reset');
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
      
      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        throw signUpError;
      }
      
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
        
        // Try to create the profile manually if it doesn't exist
        try {
          const { data: manualProfileData, error: manualProfileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: credentials.email,
              first_name: credentials.firstName || '',
              last_name: credentials.lastName || '',
              is_donor: false,
              is_recipient: false,
              is_admin: false,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (manualProfileError) {
            console.error('Error creating profile manually:', manualProfileError);
            throw manualProfileError;
          }
          
          setUser(manualProfileData as UserProfile);
        } catch (manualError) {
          console.error('Manual profile creation failed:', manualError);
          // If we can't create the profile, we'll create a temporary user object
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
        }
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
      console.log('AuthContext: Starting sign out process...');
      setIsLoading(true);
      setError(null);
      
      // Use authService instead of direct Supabase call
      const { error: signOutError } = await authService.signOut();
      
      if (signOutError) {
        console.error('AuthContext: Sign out error:', signOutError);
        throw signOutError;
      }
      
      console.log('AuthContext: Sign out successful, clearing state');
      
      // Clear user state
      setUser(null);
      setIsOnboarding(false);
      
      // Note: authService now handles clearing session storage
      
      console.log('AuthContext: Sign out complete, redirecting to home page');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('AuthContext: Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      
      // Still try to redirect even if there was an error
      console.log('AuthContext: Attempting to redirect despite error');
      window.location.href = '/';
      
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
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding function
  const completeOnboarding = async (data: Partial<UserProfile> = {}) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Completing onboarding for user:', user.id);
      
      // Split the update into two separate calls to avoid RLS recursion
      // First update the profile data
      if (Object.keys(data).length > 0) {
        const profileUpdates = {
          ...data,
          updated_at: new Date().toISOString(),
        };
        
        console.log('Updating profile data:', profileUpdates);
        
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);
          
        if (profileUpdateError) {
          console.error('Error updating profile data:', profileUpdateError);
          throw profileUpdateError;
        }
      }
      
      // Then update the onboarding_completed flag separately
      console.log('Setting onboarding_completed flag to true');
      
      const { error: completionError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (completionError) {
        console.error('Error setting onboarding_completed flag:', completionError);
        throw completionError;
      }
      
      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        ...data, 
        onboarding_completed: true,
        updated_at: new Date().toISOString() 
      } : null);
      
      setIsOnboarding(false);
      sessionStorage.setNeedsOnboarding(false);
      
      console.log('Onboarding completed successfully');
      
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err instanceof Error ? err : new Error('Failed to complete onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isOnboarding,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

// Helper functions for session storage management
const sessionStorage = {
  // Auth flags
  setAuthSuccess: (userId: string, email: string) => {
    window.sessionStorage.setItem('auth_success', 'true');
    window.sessionStorage.setItem('user_id', userId);
    window.sessionStorage.setItem('user_email', email);
  },
  
  setSignInComplete: (value: boolean = true) => {
    window.sessionStorage.setItem('sign_in_complete', value ? 'true' : 'false');
  },
  
  setNeedsOnboarding: (value: boolean) => {
    window.sessionStorage.setItem('needs_onboarding', value ? 'true' : 'false');
  },
  
  setRlsPolicyError: (value: boolean = true) => {
    window.sessionStorage.setItem('rls_policy_error', value ? 'true' : 'false');
  },
  
  // Getters
  getAuthSuccess: () => window.sessionStorage.getItem('auth_success') === 'true',
  getSignInComplete: () => window.sessionStorage.getItem('sign_in_complete') === 'true',
  getNeedsOnboarding: () => window.sessionStorage.getItem('needs_onboarding') === 'true',
  getRlsPolicyError: () => window.sessionStorage.getItem('rls_policy_error') === 'true',
  getUserId: () => window.sessionStorage.getItem('user_id'),
  getUserEmail: () => window.sessionStorage.getItem('user_email'),
  
  // Clear functions
  clearAuthFlags: () => {
    window.sessionStorage.removeItem('auth_success');
    window.sessionStorage.removeItem('sign_in_complete');
    window.sessionStorage.removeItem('needs_onboarding');
    window.sessionStorage.removeItem('rls_policy_error');
    window.sessionStorage.removeItem('user_id');
    window.sessionStorage.removeItem('user_email');
  }
};