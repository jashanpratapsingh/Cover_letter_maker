"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Signed in successfully", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false) will be handled by onAuthStateChanged
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully" });
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
