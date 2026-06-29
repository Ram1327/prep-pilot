import { PrepPlan } from '../types/plan';
import { DayStatus } from '../types/agent';

const STORAGE_PREFIX = 'preppilot_';

const getPlanKeyStr = (planKey: string) => {
  try {
    return btoa(unescape(encodeURIComponent(planKey))).slice(0, 20);
  } catch (e) {
    return planKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  }
};

export const storage = {
  saveProgress: (planKey: string, dayStatuses: DayStatus[]) => {
    const safeSum = getPlanKeyStr(planKey);
    localStorage.setItem(`${STORAGE_PREFIX}progress_${safeSum}`, JSON.stringify(dayStatuses));
  },

  loadProgress: (planKey: string): DayStatus[] => {
    const safeSum = getPlanKeyStr(planKey);
    const saved = localStorage.getItem(`${STORAGE_PREFIX}progress_${safeSum}`);
    return saved ? JSON.parse(saved) : [];
  },

  clearProgress: (planKey: string) => {
    const safeSum = getPlanKeyStr(planKey);
    localStorage.removeItem(`${STORAGE_PREFIX}progress_${safeSum}`);
  },

  clearAllSessionData: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  savePlan: (plan: PrepPlan) => {
    localStorage.setItem(`${STORAGE_PREFIX}last_plan`, JSON.stringify(plan));
  },

  loadLastPlan: (): PrepPlan | null => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}last_plan`);
    return saved ? JSON.parse(saved) : null;
  }
};
