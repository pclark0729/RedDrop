import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * Component that checks if a user needs to complete onboarding and redirects accordingly.
 * This component doesn't render anything visible - it just performs the check and redirection.
 */
const OnboardingCheck: React.FC = () => {
  const { user, isLoading, isOnboarding } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [redirectCount, setRedirectCount] = useState(0);

  // Simple effect to handle redirects based on authentication and onboarding status
  useEffect(() => {
    // Log the current state for debugging
    console.log('OnboardingCheck state:', { 
      user: !!user, 
      isLoading, 
      isOnboarding, 
      path: location.pathname,
      hasRedirected,
      redirectCount
    });

    // Don't do anything while loading
    if (isLoading) {
      return;
    }

    // Skip the check if we're already on the onboarding page or sign-in/sign-up pages
    const isAuthPage = ['/signin', '/signup', '/onboarding', '/dashboard', '/direct-onboarding'].includes(location.pathname);
    if (isAuthPage) {
      return;
    }

    // Check if we have a forced access flag in session storage
    const forcedAccess = sessionStorage.getItem('force_onboarding_access') === 'true';
    if (forcedAccess) {
      console.log('OnboardingCheck: Forced access is enabled, skipping redirect checks');
      return;
    }

    // Only redirect once per mount to avoid redirect loops
    if (hasRedirected) {
      return;
    }

    // Limit the number of redirects to prevent infinite loops
    if (redirectCount > 3) {
      console.warn('OnboardingCheck: Too many redirects, stopping');
      return;
    }

    // If user is authenticated and needs to complete onboarding, redirect to onboarding
    if (user && isOnboarding) {
      console.log('OnboardingCheck: User needs to complete onboarding, redirecting to /onboarding');
      setHasRedirected(true);
      setRedirectCount(prev => prev + 1);
      
      // Set the forced access flag to ensure the onboarding page loads
      sessionStorage.setItem('force_onboarding_access', 'true');
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, isOnboarding, location.pathname, navigate, hasRedirected, redirectCount]);

  // Reset the redirect flag when the location changes
  useEffect(() => {
    setHasRedirected(false);
  }, [location.pathname]);

  // This component doesn't render anything
  return null;
};

export default OnboardingCheck; 