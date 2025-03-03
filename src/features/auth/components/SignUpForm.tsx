import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    formState,
    formErrors,
    isSubmitting,
    handleChange,
    handleSignUp,
  } = useAuthForm({
    onSuccess,
    onError,
  });

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formState.firstName}
              onChange={handleChange}
              error={formErrors.firstName}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div>
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formState.lastName}
              onChange={handleChange}
              error={formErrors.lastName}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        
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
            placeholder="Create a password"
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
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <div>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            placeholder="Confirm your password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default SignUpForm; 