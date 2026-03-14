import { db } from "@/lib/firebase";
import { localDB } from "@/lib/db";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  addDoc,
  serverTimestamp,
  where
} from "firebase/firestore";

export interface DashboardStats {
  weeklyXP: number;
  accuracy: number;
  lessonsDone: number;
  rank: string;
}

export class AnalyticsService {
  async syncProfile(uid: string) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        await localDB.set("profile", { uid, ...profileData });
        return profileData;
      }
    } catch (error) {
      console.error("Sync Profile Error:", error);
    }
    return await localDB.get("profile", uid);
  }

  async syncQuizHistory(uid: string) {
    try {
      const historyRef = collection(db, "users", uid, "quiz_history");
      const q = query(historyRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await localDB.clearStore("quiz_history");
      for (const item of history) {
        await localDB.set("quiz_history", item);
      }
      return history;
    } catch (error) {
      console.error("Sync Quiz History Error:", error);
    }
    return await localDB.getAll("quiz_history");
  }

  async syncStats(uid: string) {
    try {
      // Style performance
      const styleRef = doc(db, "users", uid, "stats", "style_performance");
      const styleSnap = await getDoc(styleRef);
      
      // Subjects
      const subjectsRef = doc(db, "users", uid, "stats", "subjects");
      const subjectsSnap = await getDoc(subjectsRef);

      const stats = {
        uid,
        stylePerformance: styleSnap.exists() ? styleSnap.data() : {},
        subjects: subjectsSnap.exists() ? subjectsSnap.data() : {},
        lastSynced: Date.now()
      };

      await localDB.set("stats", stats);
      return stats;
    } catch (error) {
      console.error("Sync Stats Error:", error);
    }
    return await localDB.get("stats", uid);
  }

  async syncLessons(uid: string) {
    try {
      const lessonsRef = collection(db, "users", uid, "lessons");
      const q = query(lessonsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const lessons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update local storage
      await localDB.clearStore("lessons");
      for (const lesson of lessons) {
        await localDB.set("lessons", lesson);
      }
      
      return lessons;
    } catch (error) {
      console.error("Sync Lessons Error:", error);
    }
    return await localDB.getAll("lessons");
  }

  async saveQuizResult(uid: string, result: {
    topic: string;
    subject: string;
    score: number;
    totalQuestions: number;
    style: string;
    difficulty: string;
  }) {
    const quizData = {
      ...result,
      userId: uid,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };

    // 1. Save to Firestore
    try {
      const historyRef = collection(db, "users", uid, "quiz_history");
      const docRef = await addDoc(historyRef, quizData);
      
      // 2. Update stats and profile XP in Firestore (simplified for now)
      // Normally you'd use a Cloud Function or batch, but let's do it directly here for the task
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const xpGained = result.score * 10;
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await setDoc(userRef, {
          xp: (userData.xp || 0) + xpGained,
          lastActivity: serverTimestamp(),
        }, { merge: true });
      }

      // 3. Save to Local DB
      await localDB.set("quiz_history", { id: docRef.id, ...quizData });
      
      return docRef.id;
    } catch (error) {
      console.error("Save Quiz Result Error:", error);
      // Fallback: save locally only if offline
      const id = "local_" + Date.now();
      await localDB.set("quiz_history", { id, ...quizData, synced: false });
      return id;
    }
  }

  async saveLessonCompletion(uid: string, lessonData: {
    topic: string;
    subject: string;
    primaryColor: string;
    duration: number;
    learningStyle?: string;
  }) {
    const data = {
      ...lessonData,
      userId: uid,
      completedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      type: "micro-video"
    };

    try {
      // 1. Save to Firestore
      const lessonsRef = collection(db, "users", uid, "lessons");
      const docRef = await addDoc(lessonsRef, data);
      
      // 2. Save to Local DB
      await localDB.set("lessons", { id: docRef.id, ...data });
      
      return docRef.id;
    } catch (error) {
      console.error("Save Lesson Completion Error:", error);
      const id = "local_lesson_" + Date.now();
      await localDB.set("lessons", { id, ...data, synced: false });
      return id;
    }
  }

  async getDashboardStats(uid: string): Promise<DashboardStats> {
    const lessons = await localDB.getAll("lessons");
    const profile = await localDB.get("profile", uid);

    const weeklyXP = 0; // Calculate from lessons in last 7 days
    const lessonsDone = lessons.length;
    const totalScore = lessons.reduce((acc, l) => acc + (l.finalScore || 0), 0);
    const accuracy = lessonsDone > 0 ? (totalScore / (lessonsDone * 5)) * 100 : 0;
    
    let rank = "Novice";
    if (profile?.xp > 5000) rank = "Expert";
    else if (profile?.xp > 2000) rank = "Intermediate";

    return {
      weeklyXP,
      accuracy: Math.round(accuracy),
      lessonsDone,
      rank
    };
  }

  async getStreakData(uid: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    activityDays: string[];
    totalXp: number;
  }> {
    try {
      const [lessons, quizzes, profile] = await Promise.all([
        localDB.getAll("lessons"),
        localDB.getAll("quiz_history"),
        localDB.get("profile", uid)
      ]);

      // Extract all unique dates of activity
      const datesSet = new Set<string>();
      
      lessons.forEach(l => {
        if (l.completedAt) {
          datesSet.add(l.completedAt.split('T')[0]);
        } else if (l.timestamp) {
          datesSet.add(l.timestamp.split('T')[0]);
        }
      });
      
      quizzes.forEach(q => {
        if (q.timestamp) {
          datesSet.add(q.timestamp.split('T')[0]);
        }
      });

      const sortedDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (datesSet.has(today) || datesSet.has(yesterday)) {
        let checkDate = datesSet.has(today) ? today : yesterday;
        let d = new Date(checkDate);
        
        while (datesSet.has(d.toISOString().split('T')[0])) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      if (sortedDates.length > 0) {
        let tempStreak = 0;
        let prevDate: Date | null = null;
        
        // Sort ascending for longest streak calculation
        const ascDates = [...sortedDates].reverse();
        
        ascDates.forEach(dateStr => {
          const currentDate = new Date(dateStr);
          if (prevDate) {
            const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
          prevDate = currentDate;
        });
      }

      return {
        currentStreak,
        longestStreak,
        activityDays: Array.from(datesSet),
        totalXp: profile?.xp || 0
      };
    } catch (error) {
      console.error("Get Streak Data Error:", error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        activityDays: [],
        totalXp: 0
      };
    }
  }

  async syncAll(uid: string) {
    await Promise.all([
      this.syncProfile(uid),
      this.syncLessons(uid),
      this.syncQuizHistory(uid),
      this.syncStats(uid)
    ]);
  }
}

export const analyticsService = new AnalyticsService();
