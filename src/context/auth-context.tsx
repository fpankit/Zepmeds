
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';


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

export interface HealthData {
  [metricId: string]: string;
}

export interface User {
  id: string; 
  familyId?: string; // Added familyId to the user model
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  referralCode?: string;
  addresses: Address[];
  healthData?: HealthData;
  isGuest?: boolean;
  // Doctor specific fields
  isDoctor?: boolean;
  isOnline?: boolean;
  specialty?: string;
  experience?: number; // Added experience in years
  rating?: number; // Added rating
  about?: string;
  photoURL?: string;
  displayName?: string; // Add displayName to match doctor schema
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
    id: uuidv4(),
    familyId: uuidv4(),
    firstName: "Guest",
    lastName: "User",
    email: "",
    phone: "",
    age: 0,
    addresses: [],
    healthData: {},
    isGuest: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser) {
                setUser(parsedUser);
            }
        } catch (e) {
            // If parsing fails, create a new guest
            setUser(createGuestUser());
        }
    } else {
        // No user found, create a guest
        setUser(createGuestUser());
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, newUserDetails?: NewUserDetails) => {
    setLoading(true);
    
    const phone = newUserDetails?.phone || identifier;
    const userId = sanitizeForId(phone);
    const userDocRef = doc(db, "users", userId);
    
    try {
        const userDocSnap = await getDoc(userDocRef);
        let finalUser: User;

        if (userDocSnap.exists()) {
            const existingUserData = userDocSnap.data();
            finalUser = { 
                id: userDocSnap.id, 
                ...existingUserData,
                familyId: existingUserData.familyId || userDocSnap.id 
            } as User;
        } else {
            if (!newUserDetails) {
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
                id: userId,
                familyId: userId, // For new users, familyId is the same as their own ID
                ...newUserDetails,
                addresses: [defaultAddress],
                healthData: {
                    dailySteps: "7,642 steps",
                    waterIntake: "8 glasses",
                    caloriesBurned: "420 cals",
                    bloodPressure: "120/80 mmHg",
                    bloodGlucose: "95 mg/dL",
                    heartRate: "72 bpm",
                },
                isGuest: false,
                isDoctor: false, 
            };
            await setDoc(userDocRef, finalUser);
        }
        
        // Sync doctor status if the user is a doctor
        const doctorDocRef = doc(db, "doctors", finalUser.id);
        try {
            const doctorSnap = await getDoc(doctorDocRef);
            if (doctorSnap.exists()) {
                // Set doctor to be online on login and merge data
                await updateDoc(doctorDocRef, { isOnline: true });
                finalUser = { ...finalUser, ...doctorSnap.data(), isDoctor: true, isOnline: true };
            }
        } catch (e) {
            console.error("Could not sync doctor status on login:", e);
        }

        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));

    } catch (error) {
        console.error("Login/Signup Error:", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    if (user && !user.isGuest) {
      if (user.isDoctor) {
          const doctorDocRef = doc(db, "doctors", user.id);
          try {
            await updateDoc(doctorDocRef, { isOnline: false });
          } catch (e) {
             console.error("Failed to set doctor offline:", e);
          }
      }
    }
    const guest = createGuestUser();
    setUser(guest);
    localStorage.setItem('user', JSON.stringify(guest));
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
        try {
            await updateDoc(doctorDocRef, userData);
        } catch (error) {
            console.error("Could not find or update doctor document:", error);
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
