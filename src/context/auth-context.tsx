
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  id: string; 
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  referralCode?: string;
  addresses: Address[];
  isGuest?: boolean;
  // Doctor specific fields
  isDoctor?: boolean;
  isOnline?: boolean;
  specialty?: string;
  about?: string;
  photoURL?: string;
}

interface NewUserDetails {
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
  login: (identifier: string, newUserDetails?: NewUserDetails) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Omit<User, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeForId = (identifier: string) => identifier.replace(/[^a-zA-Z0-9]/g, "");

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
        setUser(createGuestUser());
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, newUserDetails?: NewUserDetails) => {
    setLoading(true);
    
    // Use phone from signup details, or the identifier from login form
    const phone = newUserDetails?.phone || identifier;
    const uid = sanitizeForId(phone); // Use sanitized phone as a stable ID
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    let finalUser: User;

    if (userDocSnap.exists()) {
      // User exists, log them in
      finalUser = { id: userDocSnap.id, ...userDocSnap.data() } as User;
    } else {
      // New user, sign them up
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
      finalUser = {
          id: uid,
          ...newUserDetails,
          addresses: [defaultAddress],
          isGuest: false,
          isDoctor: false, // Default to not a doctor
      };
      await setDoc(userDocRef, finalUser);
    }

    if (finalUser.isDoctor) {
        const doctorDocRef = doc(db, "doctors", finalUser.id);
        const doctorSnap = await getDoc(doctorDocRef);
        if (doctorSnap.exists()) {
            finalUser = { ...finalUser, ...doctorSnap.data() };
        }
    }

    setUser(finalUser);
    localStorage.setItem('user', JSON.stringify(finalUser));
    setLoading(false);
  };

  const logout = async () => {
    if (user && user.isDoctor) {
        // Doctor goes offline on logout
        const doctorDocRef = doc(db, "doctors", user.id);
        await updateDoc(doctorDocRef, { isOnline: false });
    }
    localStorage.removeItem('user');
    setUser(createGuestUser());
  };

  const updateUser = async (userData: Partial<Omit<User, 'id'>>) => {
    if (!user || user.isGuest) return;

    const updatedUser: User = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    const userDocRef = doc(db, "users", user.id);
    await updateDoc(userDocRef, userData);

    if (user.isDoctor) {
        const doctorDocRef = doc(db, "doctors", user.id);
        // Only update fields relevant to the doctors collection
        const doctorData: Partial<User> = {};
        if ('isOnline' in userData) doctorData.isOnline = userData.isOnline;
        
        if(Object.keys(doctorData).length > 0) {
           await updateDoc(doctorDocRef, doctorData);
        }
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
