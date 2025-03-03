import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth';
import SignInPage from './features/auth/pages/SignInPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import DonorProfilePage from './features/donor/pages/DonorProfilePage';
import DonorRegistrationPage from './features/donor/pages/DonorRegistrationPage';
import { NotificationPage } from './features/notification';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth routes */}
            <Route path="/auth">
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Donor routes */}
              <Route path="/donor">
                <Route path="profile" element={<DonorProfilePage />} />
                <Route path="register" element={<DonorRegistrationPage />} />
              </Route>
              
              {/* Notification routes */}
              <Route path="/notifications" element={<NotificationPage />} />
              
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
