import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpForm from '../components/SignUpForm';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful sign-up, navigate to the dashboard
    // In a real app, you might want to show a verification message first
    navigate('/dashboard');
  };

  const handleError = (error: Error) => {
    console.error('Sign up error:', error);
    // Error is already handled in the form component
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <SignUpForm onSuccess={handleSuccess} onError={handleError} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUpPage; 