
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  icon?: React.ElementType;
}

export interface User {
  id: string; // Phone number can be used as a unique ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Omit<User, 'id' | 'phone'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This could be expanded to check for a session token in localStorage
  useEffect(() => {
    // Here you would typically check for a persisted session
    // For now, we just stop the loading state
    setLoading(false);
  }, []);

  const login = async (phone: string) => {
    setLoading(true);
    const userDocRef = doc(db, "users", phone);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // User exists, load their data
      setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
    } else {
      // New user, create their profile
      const newUser: User = {
        id: phone,
        phone: phone,
        firstName: "New",
        lastName: "User",
        email: "new.user@example.com",
        addresses: [
          {
            id: 'home-123',
            type: 'Home',
            name: 'Home',
            address: '123 Main Street, Gurugram, Haryana, 122001'
          }
        ],
      };
      await setDoc(userDocRef, newUser);
      setUser(newUser);
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    // Here you would clear any persisted session
  };

  const updateUser = async (userData: Partial<Omit<User, 'id' | 'phone'>>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, userData);
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
