"use client";

import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  learningGoals?: string[];
  xp?: number;
  streak?: number;
  photoURL?: string;
  level?: number;
  role?: string;
}

export interface Lesson {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  difficulty: string;
  style: string;
  status: string;
  slideCount: number;
  finalScore: number;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch extended user profile and lessons
        try {
          // Profile
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }

          // Lessons
          const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");
          const lessonsRef = collection(db, "users", firebaseUser.uid, "lessons");
          const q = query(
            lessonsRef, 
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const lessonsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Lesson));
          setLessons(lessonsData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setProfile(null);
        setLessons([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, profile, lessons, loading, logout };
}
