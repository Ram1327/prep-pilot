import { PrepTask } from "../types/plan";

// Helper to safely parse dates regardless of if they are Firestore Timestamps, ISO strings, or Date objects
const parseDate = (val: any): Date => {
  if (!val) return new Date();
  if (typeof val === 'object' && val.seconds !== undefined) {
    return new Date(val.seconds * 1000);
  }
  if (val instanceof Date) {
    return val;
  }
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

// Helper to safely format dates in local timezone (YYYY-MM-DD)
const toLocalDateStr = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function useDashboardStats(tasks: PrepTask[]) {
  // Helper to calculate exact dynamic remaining time (days, hours, totalHours, isPast)
  const getTimeRemaining = (task: any) => {
    const now = new Date();
    const createdAt = parseDate(task.createdAt);
    const totalDaysNum = task.plan?.timeAvailable?.totalDays || 7;
    const deadline = new Date(createdAt.getTime() + totalDaysNum * 24 * 60 * 60 * 1000);
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, totalHours: 0, isPast: true };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return { days, hours, totalHours, isPast: false };
  };

  // 1. Active Plans: tasks where createdAt + totalDays is in the future
  const activePlans = tasks.filter(t => !getTimeRemaining(t).isPast).length;

  // 2. Completion Rate: (completed days / total days across all tasks) * 100
  const completedDays = tasks.reduce((sum, t) => 
    sum + (t.dayStatuses?.filter(d => d.status === 'complete').length || 0), 0);
  const totalDays = tasks.reduce((sum, t) => 
    sum + (t.plan?.dailyPlan?.length || 0), 0);
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // 3. Topics Studied: count unique keyTopics where materials were generated
  const topicsStudied = tasks.reduce((sum, t) => 
    sum + (t.plan?.keyTopics?.length || 0), 0);

  // 4. Day Streak: consecutive days where at least one day was marked complete
  const calculateStreak = () => {
    const completedDates = new Set<string>();
    tasks.forEach(t => {
      if (!t.dayStatuses) return;
      const baseTime = parseDate(t.createdAt).getTime();
      t.dayStatuses.forEach(d => {
        if (d.status === 'complete') {
          if (d.markedAt) {
            completedDates.add(d.markedAt);
          } else {
            const actionTime = baseTime + d.dayIndex * 24 * 60 * 60 * 1000;
            completedDates.add(toLocalDateStr(new Date(actionTime)));
          }
        }
      });
    });

    const sortedDates = Array.from(completedDates)
      .map(dStr => new Date(dStr))
      .sort((a, b) => b.getTime() - a.getTime()); // newest first

    let currentStreak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      yesterday.setHours(0,0,0,0);
      
      const newestDate = sortedDates[0];
      newestDate.setHours(0,0,0,0);
      
      if (newestDate.getTime() === today.getTime() || newestDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        let lastTime = newestDate.getTime();
        for (let i = 1; i < sortedDates.length; i++) {
          const current = sortedDates[i];
          current.setHours(0,0,0,0);
          const diff = lastTime - current.getTime();
          if (diff === 24 * 60 * 60 * 1000) {
            currentStreak++;
            lastTime = current.getTime();
          } else if (diff > 24 * 60 * 60 * 1000) {
            break;
          }
        }
      }
    }
    return currentStreak;
  };

  const streak = calculateStreak();

  // --- UPCOMING DEADLINES ---
  const deadlines = tasks
    .map(t => {
      const timeRemaining = getTimeRemaining(t);
      return { task: t, timeRemaining };
    })
    .sort((a, b) => {
      if (a.timeRemaining.isPast && !b.timeRemaining.isPast) return 1;
      if (!a.timeRemaining.isPast && b.timeRemaining.isPast) return -1;
      return a.timeRemaining.totalHours - b.timeRemaining.totalHours;
    });

  // --- COMPLETION TREND (7 DAYS) ---
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    d.setHours(0,0,0,0);
    return d;
  });

  const trendData = last7Days.map(date => {
    const dateStr = toLocalDateStr(date);
    const dayLabel = dayNames[date.getDay()];
    
    let completedCount = 0;
    let missedCount = 0;
    
    tasks.forEach(t => {
      if (!t.dayStatuses) return;
      const baseTime = parseDate(t.createdAt).getTime();
      t.dayStatuses.forEach(d => {
        const actionDateStr = d.markedAt
          ? d.markedAt
          : toLocalDateStr(new Date(baseTime + d.dayIndex * 24 * 60 * 60 * 1000));

        if (actionDateStr === dateStr) {
          if (d.status === 'complete') completedCount++;
          if (d.status === 'missed') missedCount++;
        }
      });
    });
    
    return {
      dateStr,
      dayLabel,
      completed: completedCount,
      missed: missedCount,
      total: completedCount + missedCount
    };
  });

  const maxTotalTrend = Math.max(...trendData.map(d => d.total), 1);

  // --- TOPIC DISTRIBUTION BY IMPORTANCE ---
  const totalTopics = tasks.reduce((sum, t) => sum + (t.plan?.keyTopics?.length || 0), 0);
  const criticalCount = tasks.reduce((sum, t) => sum + (t.plan?.keyTopics?.filter(kt => kt.importance === 'Critical')?.length || 0), 0);
  const highCount = tasks.reduce((sum, t) => sum + (t.plan?.keyTopics?.filter(kt => kt.importance === 'High')?.length || 0), 0);
  const mediumCount = tasks.reduce((sum, t) => sum + (t.plan?.keyTopics?.filter(kt => kt.importance === 'Medium')?.length || 0), 0);

  const criticalPercent = totalTopics > 0 ? Math.round((criticalCount / totalTopics) * 100) : 0;
  const highPercent = totalTopics > 0 ? Math.round((highCount / totalTopics) * 100) : 0;
  const mediumPercent = totalTopics > 0 ? Math.round((mediumCount / totalTopics) * 100) : 0;

  return {
    activePlans,
    completionRate,
    topicsStudied,
    streak,
    deadlines,
    trendData,
    maxTotalTrend,
    totalTopics,
    criticalCount,
    highCount,
    mediumCount,
    criticalPercent,
    highPercent,
    mediumPercent,
    parseDate
  };
}
