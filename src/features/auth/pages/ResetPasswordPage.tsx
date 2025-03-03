import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Success is handled in the form component with a success message
    // No navigation needed here
  };

  const handleError = (error: Error) => {
    console.error('Password reset error:', error);
    // Error is already handled in the form component
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <ResetPasswordForm onSuccess={handleSuccess} onError={handleError} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage; 