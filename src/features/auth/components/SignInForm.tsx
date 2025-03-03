import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState,
    formErrors,
    isSubmitting,
    handleChange,
    handleSignIn,
  } = useAuthForm({
    onSuccess,
    onError,
  });

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      
      <form onSubmit={handleSignIn} className="space-y-4">
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
        
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formState.password}
            onChange={handleChange}
            error={formErrors.password}
            placeholder="Enter your password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
        </div>
        
        <div className="text-right">
          <Link to="/auth/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
            Forgot password?
          </Link>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default SignInForm; 