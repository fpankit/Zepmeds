
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isPossiblePhoneNumber } from "react-phone-number-input";

export interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  flat: string;
  street: string;
  landmark?: string;
  pincode: string;
  state: string;
  icon?: React.ElementType;
}


export interface User {
  id: string; // Document ID, which will be a sanitized phone number or email
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  referralCode?: string;
  addresses: Address[];
}

interface NewUser_ {
    firstName: string;
    lastName: string;
    age: number;
    phone: string;
    email: string;
    referralCode?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, newUserDetails?: NewUser_) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Omit<User, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sanitize identifier to be a valid Firestore document ID
const sanitizeForId = (identifier: string) => identifier.replace(/[^a-zA-Z0-9]/g, "_");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This could be expanded to check for a session token in localStorage
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (identifier: string, newUserDetails?: NewUser_) => {
    setLoading(true);
    let userId: string;
    let userDocRef;
    let userDocSnap;

    // Check if identifier is a phone number or email to query correctly
    if (isPossiblePhoneNumber(identifier || '')) {
        userId = sanitizeForId(identifier);
        userDocRef = doc(db, "users", userId);
        userDocSnap = await getDoc(userDocRef);
    } else {
        // This would require a query, which needs an index. 
        // For this mock, we will assume login is by phone number if user exists.
        // In a real app, you'd query the 'users' collection where 'email' == identifier.
        // For now, we will create a new user based on email if details are provided.
        userId = sanitizeForId(newUserDetails?.phone || identifier);
        userDocRef = doc(db, "users", userId);
        userDocSnap = await getDoc(userDocRef);
    }
    
    if (userDocSnap.exists()) {
      setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
    } else if (newUserDetails) {
      // New user, create their profile from sign-up data
      const defaultAddress: Address = {
        id: 'home-123',
        type: 'Home',
        name: 'Home',
        flat: 'A-123',
        street: 'Main Street',
        pincode: '122001',
        state: 'Haryana',
        address: 'A-123, Main Street, Gurugram, Haryana, 122001'
      };
      const newUser: User = {
        id: userId,
        ...newUserDetails,
        addresses: [defaultAddress],
      };
      await setDoc(userDocRef, newUser);
      setUser(newUser);
    } else {
        // User not found and no sign-up details provided
        console.error("Login failed: User not found.");
        // Here you might want to redirect to sign-up or show an error
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (userData: Partial<Omit<User, 'id'>>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, userData);
      setUser(prevUser => {
        if (!prevUser) return null;
        // Create a new object to ensure state update is detected
        const updatedUser = { ...prevUser, ...userData };
        return updatedUser;
      });
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
