
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
  id: string; // This will now be the Firebase Auth UID
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

// This is a mock of what Firebase Auth would return
interface MockAuthResult {
    uid: string;
    isNewUser: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, newUserDetails?: NewUser_) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Omit<User, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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


// Mock Firebase Auth sign-in/sign-up
const mockFirebaseAuth = async (identifier: string): Promise<MockAuthResult> => {
    // In a real app, this would involve calling Firebase Auth functions.
    // For this prototype, we'll simulate it. We'll use the sanitized
    // identifier as the user ID (uid).
    const uid = sanitizeForId(identifier);
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    return {
        uid: uid,
        isNewUser: !userDocSnap.exists(),
    }
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // If stored user is guest, keep them as guest
        if (parsedUser.isGuest) {
            setUser(createGuestUser());
        } else {
            setUser(parsedUser);
        }
    } else {
        setUser(createGuestUser());
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, newUserDetails?: NewUser_) => {
    setLoading(true);
    
    const phone = newUserDetails?.phone || identifier;
    const authResult = await mockFirebaseAuth(phone);
    const userDocRef = doc(db, "users", authResult.uid);

    if (authResult.isNewUser) {
        if (!newUserDetails) {
            setLoading(false);
            throw new Error("User not found. Please sign up.");
        }
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
            id: authResult.uid,
            ...newUserDetails,
            addresses: [defaultAddress],
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    } else {
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            // This case should ideally not happen if logic is correct
            setLoading(false);
            throw new Error("User data not found after authentication.");
        }
        const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }
    setLoading(false);
  };

  const logout = () => {
    // In a real app, you'd also call Firebase signOut() here
    localStorage.removeItem('user');
    setUser(createGuestUser());
  };

  const updateUser = async (userData: Partial<Omit<User, 'id'>>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Only update Firestore if the user is not a guest
    if (!user.isGuest) {
        const userDocRef = doc(db, "users", user.id);
        await updateDoc(userDocRef, userData);
    }
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
