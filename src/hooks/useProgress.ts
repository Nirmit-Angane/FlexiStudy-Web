"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TopicProgress {
  completedModules: number[];
}

export interface ProgressStore {
  [topicKey: string]: TopicProgress;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "flexistudy_progress";

function loadFromStorage(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

function saveToStorage(data: ProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useProgress() {
  const [store, setStore] = useState<ProgressStore>({});

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setStore(loadFromStorage());
  }, []);

  /** Returns the sorted array of completed module ids for a given topic. */
  const getCompletedModules = useCallback(
    (topicKey: string): number[] => {
      return store[topicKey]?.completedModules ?? [];
    },
    [store]
  );

  /** Returns true if a specific module is completed. */
  const isModuleCompleted = useCallback(
    (topicKey: string, moduleId: number): boolean => {
      return (store[topicKey]?.completedModules ?? []).includes(moduleId);
    },
    [store]
  );

  /**
   * Returns the derived status of a module:
   * - "done"   → completed
   * - "locked" → previous module not yet completed (module 1 is always unlocked)
   * - "active" → the next module to work on
   */
  const getModuleStatus = useCallback(
    (
      topicKey: string,
      moduleId: number
    ): "done" | "active" | "locked" => {
      if (isModuleCompleted(topicKey, moduleId)) return "done";
      // Module 1 is always accessible
      if (moduleId === 1) return "active";
      // Accessible only if previous module is done
      if (isModuleCompleted(topicKey, moduleId - 1)) return "active";
      return "locked";
    },
    [isModuleCompleted]
  );

  /**
   * Returns 0-100 progress percentage for a topic, based on localStorage.
   */
  const getProgress = useCallback(
    (topicKey: string, totalModules: number): number => {
      const completed = (store[topicKey]?.completedModules ?? []).length;
      if (totalModules === 0) return 0;
      return Math.round((completed / totalModules) * 100);
    },
    [store]
  );

  /**
   * Mark a module as completed, then persist to localStorage.
   * Safe to call multiple times (idempotent).
   */
  const markComplete = useCallback(
    (topicKey: string, moduleId: number) => {
      setStore((prev) => {
        const existing = prev[topicKey]?.completedModules ?? [];
        if (existing.includes(moduleId)) return prev; // already done, no change
        const next: ProgressStore = {
          ...prev,
          [topicKey]: {
            completedModules: [...existing, moduleId],
          },
        };
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  /**
   * Reset all progress (e.g. for testing). Clears localStorage.
   */
  const resetAll = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setStore({});
  }, []);

  return {
    getCompletedModules,
    isModuleCompleted,
    getModuleStatus,
    getProgress,
    markComplete,
    resetAll,
  };
}
