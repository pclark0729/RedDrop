import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SignUpCredentials } from '../types';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (credentials.password !== value) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError(null);
      }
    } else {
      setCredentials(prev => ({ ...prev, [name]: value }));
      
      // Check password match if confirm password is already entered
      if (name === 'password' && confirmPassword) {
        if (value !== confirmPassword) {
          setPasswordError('Passwords do not match');
        } else {
          setPasswordError(null);
        }
      }
    }
    
    setError(null); // Clear general error when user types
  };

  const validateForm = (): boolean => {
    // Check if passwords match
    if (credentials.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (credentials.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    // All validations passed
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signUp(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">
            Join the Blood Donation Management System
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                type="text"
                name="first_name"
                value={credentials.first_name}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            
            <div>
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                value={credentials.last_name}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={passwordError}
            />
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !!passwordError}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage; 