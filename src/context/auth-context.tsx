
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  name: string;
  phone: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: Pick<User, 'phone' | 'name'>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Omit<User, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This could be expanded to check for a session token in localStorage
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (userData: Pick<User, 'phone' | 'name'>) => {
    setLoading(true);
    const userDocRef = doc(db, "users", userData.phone);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // User exists, load their data
      setUser(userDocSnap.data() as User);
    } else {
      // New user, create their profile
      const newUser: User = {
        id: userData.phone,
        phone: userData.phone,
        name: userData.name,
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
  };

  const updateUser = async (userData: Partial<Omit<User, 'id'>>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      const userDocRef = doc(db, "users", user.id);
      await setDoc(userDocRef, updatedUser, { merge: true });
      setUser(updatedUser);
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
