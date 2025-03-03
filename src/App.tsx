import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth';
import SignInPage from './features/auth/pages/SignInPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import DonorProfilePage from './features/donor/pages/DonorProfilePage';
import DonorRegistrationPage from './features/donor/pages/DonorRegistrationPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Layout component to wrap routes with Header and Footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

// Placeholder Dashboard component - will be replaced with actual dashboard later
const Dashboard = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Welcome to the Blood Donation Management System!</p>
  </div>
);

// Placeholder Home component - will be replaced with actual home page later
const Home = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-2xl font-bold mb-4">Blood Donation Management System</h1>
    <p>Welcome to the Blood Donation Management System. Please sign in or sign up to continue.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth routes */}
            <Route path="/auth">
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Donor routes */}
              <Route path="/donor">
                <Route path="profile" element={<DonorProfilePage />} />
                <Route path="register" element={<DonorRegistrationPage />} />
              </Route>
              
              {/* Add more protected routes here */}
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
