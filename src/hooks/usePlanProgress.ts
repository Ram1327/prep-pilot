import React, { useState, useEffect } from 'react';
import { DayStatus } from '../types/agent';
import { PrepPlan } from '../types/plan';
import { storage } from '../lib/storage';

export interface UsePlanProgressReturn {
  dayStatuses: DayStatus[];
  setDayStatuses: React.Dispatch<React.SetStateAction<DayStatus[]>>;
  isReplanning: boolean;
  markDayComplete: (dayIndex: number) => void;
  markDayMissed: (
    dayIndex: number, 
    plan: PrepPlan, 
    setPlan: (p: PrepPlan) => void, 
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
  ) => Promise<void>;
  clearProgress: () => void;
  loadProgress: (planKey: string) => void;
}

export function usePlanProgress(
  planKey: string,
  initialStatuses?: DayStatus[],
  activeTaskId?: string | null,
  onProgressChange?: (statuses: DayStatus[]) => void
): UsePlanProgressReturn {
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [isReplanning, setIsReplanning] = useState(false);

  // Load progress when plan key, initialStatuses, or activeTaskId changes
  useEffect(() => {
    if (activeTaskId) {
      const nextStatuses = initialStatuses || [];
      setDayStatuses((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(nextStatuses)) {
          return prev;
        }
        return nextStatuses;
      });
    } else if (planKey) {
      const saved = storage.loadProgress(planKey);
      setDayStatuses((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(saved)) {
          return prev;
        }
        return saved;
      });
    } else {
      setDayStatuses((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
    }
  }, [activeTaskId, planKey, initialStatuses]);

  const markDayComplete = (dayIndex: number) => {
    if (!planKey) return;
    const todayISO = new Date().toISOString().split('T')[0];
    const filtered = dayStatuses.filter(d => d.dayIndex !== dayIndex);
    const updated = [...filtered, { dayIndex, status: 'complete' as const, markedAt: todayISO }];
    setDayStatuses(updated);
    storage.saveProgress(planKey, updated);
    if (onProgressChange) {
      onProgressChange(updated);
    }
  };

  const markDayMissed = async (
    dayIndex: number, 
    plan: PrepPlan, 
    setPlan: (p: PrepPlan) => void,
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
  ) => {
    if (!planKey) return;

    // First, immediately save missed state locally
    const todayISO = new Date().toISOString().split('T')[0];
    const filtered = dayStatuses.filter(d => d.dayIndex !== dayIndex);
    const updatedStatuses = [...filtered, { dayIndex, status: 'missed' as const, markedAt: todayISO }];
    setDayStatuses(updatedStatuses);
    storage.saveProgress(planKey, updatedStatuses);
    if (onProgressChange) {
      onProgressChange(updatedStatuses);
    }

    // Trigger server-side replanning
    setIsReplanning(true);

    const completedDays = updatedStatuses
      .filter(d => d.status === 'complete')
      .map(d => d.dayIndex);
    
    const remainingDays = plan.dailyPlan
      .filter((_, i) => i > dayIndex && !completedDays.includes(i));

    if (remainingDays.length === 0) {
      setIsReplanning(false);
      showToast("ohh no you have missed this but all the best", "info");
      return;
    }

    try {
      const response = await fetch('/api/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContext: plan.goalSummary,
          daysAvailable: remainingDays.length,
          urgencyLevel: plan.timeAvailable.intensity,
          missedTopics: plan.dailyPlan[dayIndex].theme,
          remainingPlan: remainingDays,
          keyTopics: plan.keyTopics,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Replan failed");
      }

      const { revisedDays } = resData;

      // Merge remaining day cards
      const preservedDays = plan.dailyPlan.slice(0, dayIndex + 1);
      const adaptedDays = revisedDays.map((d: any, index: number) => ({
        ...d,
        day: dayIndex + 2 + index,
        isAdapted: true
      }));

      const updatedDailyPlan = [...preservedDays, ...adaptedDays];
      const updatedPlan = {
        ...plan,
        dailyPlan: updatedDailyPlan
      };

      setPlan(updatedPlan);
      // Save revised plan to last plan storage so it persists on refresh
      storage.savePlan(updatedPlan);

      showToast('⚡ PrepPilot has adapted your plan based on your progress.');
    } catch (err) {
      showToast('Could not replan. Please try again.', 'error');
    } finally {
      setIsReplanning(false);
    }
  };

  const clearProgress = () => {
    if (!planKey) return;
    setDayStatuses([]);
    storage.clearProgress(planKey);
  };

  const loadProgress = (key: string) => {
    const saved = storage.loadProgress(key);
    setDayStatuses(saved);
  };

  return {
    dayStatuses,
    setDayStatuses,
    isReplanning,
    markDayComplete,
    markDayMissed,
    clearProgress,
    loadProgress,
  };
}
export default usePlanProgress;
