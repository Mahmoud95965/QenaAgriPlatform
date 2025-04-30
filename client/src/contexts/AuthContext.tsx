import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, getUserByUid } from "@/lib/firebase";
import { UserRole } from "@shared/schema";
import { DocumentData } from "firebase/firestore";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  isAdmin: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  isProfessor: false,
  isStudent: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getUserByUid(firebaseUser.uid);
          setUserData(userDoc);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Determine user roles
  const isAdmin = userData?.role === UserRole.ADMIN;
  const isProfessor = userData?.role === UserRole.PROFESSOR;
  const isStudent = userData?.role === UserRole.STUDENT;
  
  // للتصحيح: طباعة البيانات في وحدة التحكم
  console.log("AuthContext - userData:", userData);
  console.log("AuthContext - user roles:", { isAdmin, isProfessor, isStudent });

  const value = {
    user,
    userData,
    isAdmin,
    isProfessor,
    isStudent,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
