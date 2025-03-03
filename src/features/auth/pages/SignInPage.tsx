import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/SignInForm';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleError = (error: Error) => {
    console.error('Sign in error:', error);
    // Error is already handled in the form component
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <SignInForm onSuccess={handleSuccess} onError={handleError} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignInPage; 