
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
  isGuest?: boolean;
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

const createGuestUser = (): User => ({
    id: `guest_${Date.now()}`,
    firstName: "Guest",
    lastName: "User",
    email: "",
    phone: "",
    age: 0,
    addresses: [],
    isGuest: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    } else {
        // If no user is stored, create a guest user
        setUser(createGuestUser());
    }
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
        userId = sanitizeForId(newUserDetails?.phone || identifier);
        userDocRef = doc(db, "users", userId);
        userDocSnap = await getDoc(userDocRef);
    }
    
    if (userDocSnap.exists()) {
      const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else if (newUserDetails) {
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
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
        setLoading(false);
        throw new Error("User not found. Please check your details or sign up.");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(createGuestUser());
  };

  const updateUser = async (userData: Partial<Omit<User, 'id'>>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedUser = { ...prevUser, ...userData };
      
      // Update localStorage immediately for both guest and logged-in users
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If the user is not a guest, also update Firestore
      if (!prevUser.isGuest) {
        const userDocRef = doc(db, "users", prevUser.id);
        // Use a separate async function to not block the state update
        const updateFirestore = async () => {
            await updateDoc(userDocRef, userData);
        }
        updateFirestore().catch(console.error);
      }
      
      return updatedUser;
    });
  };

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
