import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Card from '../../../components/Card';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess, onError }) => {
  const [resetSent, setResetSent] = useState(false);
  
  const {
    formState,
    formErrors,
    isSubmitting,
    handleChange,
    handleResetPassword,
  } = useAuthForm({
    onSuccess: () => {
      setResetSent(true);
      onSuccess?.();
    },
    onError,
  });

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      
      {resetSent ? (
        <div className="text-center">
          <div className="mb-4 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
          <p className="text-gray-600 mb-4">
            We've sent a password reset link to <strong>{formState.email}</strong>.
            Please check your email and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            If you don't see the email, check your spam folder or try again.
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setResetSent(false)}
            >
              Try Again
            </Button>
            <Link to="/auth/signin">
              <Button variant="link" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-gray-600 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              error={formErrors.email}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/auth/signin" className="text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ResetPasswordForm; 