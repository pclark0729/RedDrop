import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface FormState {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

interface UseAuthFormProps {
  initialState?: Partial<FormState>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAuthForm = ({ 
  initialState = {}, 
  onSuccess, 
  onError 
}: UseAuthFormProps = {}) => {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    ...initialState,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name as keyof FormState]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (type: 'signup' | 'signin' | 'reset'): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    
    // Email validation
    if (!formState.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation for signup and signin
    if (type !== 'reset') {
      if (!formState.password) {
        errors.password = 'Password is required';
      } else if (formState.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    // Additional validations for signup
    if (type === 'signup') {
      if (!formState.firstName) {
        errors.firstName = 'First name is required';
      }
      
      if (!formState.lastName) {
        errors.lastName = 'Last name is required';
      }
      
      if (formState.confirmPassword !== formState.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('signup')) return;
    
    setIsSubmitting(true);
    try {
      await signUp(
        formState.email,
        formState.password,
        formState.firstName,
        formState.lastName
      );
      onSuccess?.();
    } catch (error) {
      console.error('Sign up error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to sign up'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('signin')) return;
    
    setIsSubmitting(true);
    try {
      await signIn(formState.email, formState.password);
      onSuccess?.();
    } catch (error) {
      console.error('Sign in error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('reset')) return;
    
    setIsSubmitting(true);
    try {
      await resetPassword(formState.email);
      onSuccess?.();
    } catch (error) {
      console.error('Reset password error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to reset password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    formErrors,
    isSubmitting,
    handleChange,
    handleSignUp,
    handleSignIn,
    handleResetPassword,
    setFormState,
  };
};

export default useAuthForm; 