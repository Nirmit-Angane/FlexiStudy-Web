import { db } from "./firebase";
import { localDB } from "./db";
import { 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  collection,
  getDoc
} from "firebase/firestore";

/**
 * Saves or updates a lesson in the user's sub-collection.
 */
export async function saveLesson(userId: string, lessonId: string, data: any) {
  const lessonRef = doc(db, "users", userId, "lessons", lessonId);
  await setDoc(lessonRef, {
    ...data,
    updatedAt: serverTimestamp(),
    // Ensure createdAt is preserved if it's an update, or set if new
    createdAt: data.createdAt || serverTimestamp(),
  }, { merge: true });
}

/**
 * Updates global user stats like XP and streaks.
 */
export async function updateUserStats(userId: string, xpGain: number) {
  const userRef = doc(db, "users", userId);
  
  // We check if the document exists first to avoid errors on partial profiless
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Initialize if somehow missing
    await setDoc(userRef, {
      xp: xpGain,
      streak: 1,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });
    return;
  }

  const userData = userSnap.data();
  const lastActivity = userData.lastActivity?.toDate();
  const now = new Date();
  
  let streakUpdate = {};
  
  if (lastActivity) {
    const diffInDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 1) {
      // Streak continues
      streakUpdate = { streak: increment(1) };
    } else if (diffInDays > 1) {
      // Streak broken
      streakUpdate = { streak: 1 };
    }
    // Else: same day, keep streak as is
  }

  await updateDoc(userRef, {
    xp: increment(xpGain),
    ...streakUpdate,
    lastActivity: serverTimestamp(),
  });
}

/**
 * Saves a quiz result to the user's history and updates their average style performance.
 */
export async function saveQuizResult(userId: string, quizData: {
  topic: string;
  subject: string;
  style: string;
  score: number;
  total: number;
}) {
  // 1. Save to history
  const historyRef = collection(db, "users", userId, "quiz_history");
  await setDoc(doc(historyRef), {
    ...quizData,
    timestamp: serverTimestamp(),
  });

  // 2. Update style performance stats
  const statsRef = doc(db, "users", userId, "stats", "style_performance");
  const statsSnap = await getDoc(statsRef);
  
  const currentStats = statsSnap.exists() ? statsSnap.data() : {};
  const styleKey = quizData.style || "Interactive";
  const existing = currentStats[styleKey] || { totalScore: 0, count: 0 };
  
  await setDoc(statsRef, {
    [styleKey]: {
      totalScore: existing.totalScore + (quizData.score / quizData.total),
      count: existing.count + 1,
      avgScore: (existing.totalScore + (quizData.score / quizData.total)) / (existing.count + 1)
    }
  }, { merge: true });

  // 3. Update subject counts
  const subjectRef = doc(db, "users", userId, "stats", "subjects");
  await setDoc(subjectRef, {
    [quizData.subject]: increment(1)
  }, { merge: true });

  // 4. Update local DB for immediate UI update
  try {
    const stats = await localDB.get("stats", userId);
    if (stats) {
      // Update local style performance
      if (!stats.stylePerformance) stats.stylePerformance = {};
      const localExisting = stats.stylePerformance[styleKey] || { totalScore: 0, count: 0 };
      const newTotalScore = localExisting.totalScore + (quizData.score / quizData.total);
      const newCount = localExisting.count + 1;
      stats.stylePerformance[styleKey] = {
        totalScore: newTotalScore,
        count: newCount,
        avgScore: newTotalScore / newCount
      };

      // Update local subjects
      if (!stats.subjects) stats.subjects = {};
      stats.subjects[quizData.subject] = (stats.subjects[quizData.subject] || 0) + 1;

      await localDB.set("stats", stats);
    }
  } catch (err) {
    console.warn("Failed to update local stats:", err);
  }
}
