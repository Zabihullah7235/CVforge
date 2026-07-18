import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isVerified: boolean;
  login: (emailVal: string, passwordVal: string) => Promise<User>;
  signup: (
    emailVal: string,
    passwordVal: string,
    fullName: string,
    username: string,
    country: string,
    phone: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  sendPasswordReset: (emailVal: string) => Promise<any>;
  signInWithGoogle: (emailVal?: string, fullNameVal?: string) => Promise<User>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Auto restore and monitor user verification state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      try {
        if (firebaseUser) {
          // Check if there is a cached profile or sync with the backend
          const savedUser = localStorage.getItem('cvforge_user');
          const token = localStorage.getItem('cvforge_token');
          if (savedUser && token) {
            try {
              const u = JSON.parse(savedUser);
              // Check if verified status changed on raw firebase user object
              if (firebaseUser.emailVerified !== undefined) {
                u.isVerified = firebaseUser.emailVerified;
              }
              setCurrentUser(u);
            } catch (e) {
              console.error('Error parsing stored user', e);
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Session restoration failed', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailVal: string, passwordVal: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await auth.signInWithEmailAndPassword(emailVal, passwordVal);
      const userObj = res.customProfile;
      setCurrentUser(userObj);
      localStorage.setItem('cvforge_user', JSON.stringify(userObj));
      localStorage.setItem('cvforge_token', res.token);
      return userObj;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    emailVal: string,
    passwordVal: string,
    fullName: string,
    username: string,
    country: string,
    phone: string
  ): Promise<User> => {
    setLoading(true);
    try {
      const res = await auth.createUserWithEmailAndPassword(
        emailVal,
        passwordVal,
        fullName,
        username,
        country,
        phone
      );
      const userObj = res.customProfile;
      setCurrentUser(userObj);
      localStorage.setItem('cvforge_user', JSON.stringify(userObj));
      localStorage.setItem('cvforge_token', res.token);
      return userObj;
    } catch (error) {
      console.error('Signup error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('cvforge_user');
      localStorage.removeItem('cvforge_token');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (emailVal: string): Promise<any> => {
    try {
      return await auth.sendPasswordResetEmail(emailVal);
    } catch (error) {
      console.error('Password reset error', error);
      throw error;
    }
  };

  const signInWithGoogle = async (emailVal?: string, fullNameVal?: string): Promise<User> => {
    setLoading(true);
    try {
      const actualEmail = emailVal || 'zabihullah7235@gmail.com';
      const actualName = fullNameVal || 'Zabihullah Master';
      const res = await auth.signInWithPopupGoogle(actualEmail, actualName);
      const userObj = res.customProfile;
      setCurrentUser(userObj);
      localStorage.setItem('cvforge_user', JSON.stringify(userObj));
      localStorage.setItem('cvforge_token', res.token);
      return userObj;
    } catch (error) {
      console.error('Google Sign-In error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    const token = localStorage.getItem('cvforge_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('cvforge_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Could not refresh session from backend', err);
    }
  };

  const isVerified = currentUser?.isVerified !== false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isVerified,
        login,
        signup,
        logout,
        sendPasswordReset,
        signInWithGoogle,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
