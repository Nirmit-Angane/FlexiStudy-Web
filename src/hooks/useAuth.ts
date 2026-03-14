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
          const { analyticsService } = await import("@/services/analyticsService");
          const { localDB } = await import("@/lib/db");
          
          // Trigger background sync
          analyticsService.syncAll(firebaseUser.uid).catch(console.error);

          // Initial load from local DB (fast)
          const localProfile = await localDB.get("profile", firebaseUser.uid);
          if (localProfile) setProfile(localProfile);

          const localLessons = await localDB.getAll("lessons");
          if (localLessons.length > 0) setLessons(localLessons);

          // If local is empty or we want to wait for first sync
          if (!localProfile) {
            const profileData = await analyticsService.syncProfile(firebaseUser.uid);
            if (profileData) setProfile(profileData as UserProfile);
          }

          if (localLessons.length === 0) {
            const lessonsData = await analyticsService.syncLessons(firebaseUser.uid);
            if (lessonsData) setLessons(lessonsData as Lesson[]);
          }
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
