'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import axios from 'axios';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  authProvider: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    }, 175);

    const finishLoading = () => {
      if (!isMounted) return;
      clearTimeout(fallbackTimer);
      setLoading(false);
    };

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!isMounted) return;

        if (firebaseUser) {
          const provider =
            firebaseUser.providerData[0]?.providerId || 'password';

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            authProvider: provider,
          };

          setUser(authUser);
          setIsAuthenticated(true);
          finishLoading();

          // Non-blocking sync - use requestIdleCallback for better performance
          const syncUser = () => {
            axios
              .post('/api/auth', {
                uid: authUser.uid,
                email: authUser.email,
                name:
                  authUser.displayName ||
                  authUser.email?.split('@')[0] ||
                  'User',
                image: authUser.photoURL,
                authProvider: authUser.authProvider,
              })
              .catch((error) => {
                console.error('Error syncing user to MongoDB:', error);
              });
          };

          if (
            typeof window !== 'undefined' &&
            'requestIdleCallback' in window
          ) {
            requestIdleCallback(syncUser);
          } else {
            setTimeout(syncUser, 0);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          finishLoading();
        }
      } catch (error) {
        console.error('Error in auth state changed:', error);
        setUser(null);
        setIsAuthenticated(false);
        finishLoading();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      throw error;
    }
  };

  const getIdToken = async (): Promise<string> => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return '';
    }

    try {
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('[FirebaseAuth] Error getting ID token:', error);
      return '';
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, isAuthenticated, getIdToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within AuthProvider');
  }
  return context;
};
