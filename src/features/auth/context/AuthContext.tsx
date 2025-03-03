import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, authService } from '../services/authService';
import supabase from '../../../app/supabase';
import { AuthContextType } from '../types';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };

export default AuthContext;