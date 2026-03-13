import { db } from "./firebase";
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
