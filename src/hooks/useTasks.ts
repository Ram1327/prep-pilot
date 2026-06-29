import { useState, useEffect, useRef } from 'react';
import {
  collection, doc, setDoc, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PrepTask, PrepPlan, DayStatus, IntegrationHistoryItem } from '../types/plan';

const LOCAL_KEY = 'preppilot_tasks_v1';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<PrepTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const isCreatingNewRef = useRef(isCreatingNew);
  const activeTaskIdRef = useRef(activeTaskId);

  useEffect(() => {
    isCreatingNewRef.current = isCreatingNew;
  }, [isCreatingNew]);

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  useEffect(() => {
    if (!userId) {
      // Not logged in — use localStorage only
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        const parsed: PrepTask[] = saved ? JSON.parse(saved) : [];
        setTasks(parsed);
        if (parsed.length > 0) {
          setActiveTaskId(parsed[0].id);
          setIsCreatingNew(false);
        } else {
          setActiveTaskId(null);
          setIsCreatingNew(true);
        }
      } catch {
        localStorage.removeItem(LOCAL_KEY);
      }
      setTasksLoading(false);
      return;
    }

    // Logged in — check for migration FIRST, then subscribe
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    // Read local tasks synchronously immediately
    const localTasksRaw = localStorage.getItem(LOCAL_KEY);
    let localTasks: PrepTask[] = [];
    if (localTasksRaw) {
      try {
        localTasks = JSON.parse(localTasksRaw);
        if (localTasks.length > 0) {
          // Optimistically show cached local tasks to the user while loading/migrating
          setTasks(localTasks);
          setActiveTaskId(localTasks[0].id);
          setIsCreatingNew(false);
        }
      } catch (e) {
        console.error("Failed to parse cached local tasks", e);
      }
    }

    let unsubscribed = false;
    let unsubscribe: (() => void) | null = null;

    const setupSync = async () => {
      // 1. Perform migration if local tasks exist
      if (localTasks.length > 0) {
        try {
          const { getDocs } = await import('firebase/firestore');
          const snap = await getDocs(tasksRef);
          if (snap.empty) {
            for (const task of localTasks) {
              const { id, ...taskToSave } = task;
              await addDoc(tasksRef, {
                ...taskToSave,
                createdAt: serverTimestamp(),
              });
            }
          }
          // Now safe to clear local storage migrated cache
          localStorage.removeItem(LOCAL_KEY);
        } catch (err) {
          console.error("Local storage migration failed:", err);
        }
      }

      if (unsubscribed) return;

      // 2. Subscribe to firestore updates
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreTasks: PrepTask[] = snapshot.docs.map(d => ({
          ...(d.data() as any),
          id: d.id,
        }));
        
        setTasks(prevTasks => {
          const merged = firestoreTasks.map(fTask => {
            const localTask = prevTasks.find(t => t.id === fTask.id);
            if (localTask) {
              const localTime = new Date(localTask.updatedAt || localTask.createdAt || 0).getTime();
              const firestoreTime = new Date(fTask.updatedAt || fTask.createdAt || 0).getTime();
              if (localTime > firestoreTime) {
                return localTask;
              }
            }
            return fTask;
          });

          const localOnly = prevTasks.filter(t => !t.id || !firestoreTasks.some(f => f.id === t.id));
          const finalTasks = [...localOnly, ...merged];

          finalTasks.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          });

          localStorage.setItem(LOCAL_KEY, JSON.stringify(finalTasks));

          if (finalTasks.length > 0) {
            if (isCreatingNewRef.current && !activeTaskIdRef.current) {
              setTimeout(() => {
                setActiveTaskId(finalTasks[0].id);
                setIsCreatingNew(false);
              }, 0);
            }
          } else {
            setTimeout(() => {
              setActiveTaskId(null);
              setIsCreatingNew(true);
            }, 0);
          }

          return finalTasks;
        });

        setTasksLoading(false);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        setTasksLoading(false);
      });
    };

    setupSync();

    return () => {
      unsubscribed = true;
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  const createTask = async (description: string, plan: PrepPlan): Promise<PrepTask> => {
    const isoNow = new Date().toISOString();
    let taskId = Date.now().toString();
    let docRef: any = null;

    if (userId) {
      try {
        const tasksRef = collection(db, 'users', userId, 'tasks');
        docRef = doc(tasksRef);
        taskId = docRef.id;
      } catch (err) {
        console.error("Failed to generate Firestore doc ref:", err);
      }
    }

    const newTask: PrepTask = {
      id: taskId,
      title: description.length > 45 ? description.slice(0, 45) + '...' : description,
      description,
      deadlineType: (plan as any).pipelineMetadata?.deadlineType || 'other',
      createdAt: isoNow,
      updatedAt: isoNow,
      plan,
      dayStatuses: [],
    };

    // Update local state immediately
    setTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveTaskId(newTask.id);
    setIsCreatingNew(false);

    // Save to Firestore in background
    if (userId && docRef) {
      (async () => {
        try {
          await setDoc(docRef, {
            ...newTask,
            createdAt: serverTimestamp(),
            updatedAt: isoNow,
          });
        } catch (err) {
          console.error("Failed to save task to Firestore:", err);
        }
      })();
    }

    return newTask;
  };

  const deleteTask = async (id: string) => {
    // Single atomic update: filter + determine next active task in one pass
    setTasks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(filtered));

      // If the deleted task was the active one, select the next available
      if (id === activeTaskIdRef.current) {
        if (filtered.length > 0) {
          setTimeout(() => {
            setActiveTaskId(filtered[0].id);
            setIsCreatingNew(false);
          }, 0);
        } else {
          setTimeout(() => {
            setActiveTaskId(null);
            setIsCreatingNew(true);
          }, 0);
        }
      }

      return filtered;
    });

    if (userId) {
      try {
        deleteDoc(doc(db, 'users', userId, 'tasks', id)).catch(err => {
          console.error("Failed to delete task from Firestore:", err);
        });
      } catch (err) {
        console.error("Error setting up deleteDoc:", err);
      }
    }
  };

  const updateTaskProgress = async (taskId: string, dayStatuses: DayStatus[]) => {
    const isoNow = new Date().toISOString();

    // Update local state immediately
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, dayStatuses, updatedAt: isoNow } : t);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });

    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
          dayStatuses,
          updatedAt: isoNow
        });
      } catch (err) {
        console.error("Failed to update task progress in Firestore:", err);
      }
    }
  };

  const updateTaskPlan = async (taskId: string, updatedPlan: PrepPlan) => {
    const isoNow = new Date().toISOString();

    // Update local state immediately
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, plan: updatedPlan, updatedAt: isoNow } : t);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });

    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
          plan: updatedPlan,
          updatedAt: isoNow
        });
      } catch (err) {
        console.error("Failed to update task plan in Firestore:", err);
      }
    }
  };

  const updateTaskChecklist = async (taskId: string, checklistStatuses: Record<string, boolean>) => {
    const isoNow = new Date().toISOString();

    // Update local state immediately
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, checklistStatuses, updatedAt: isoNow } : t);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });

    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
          checklistStatuses,
          updatedAt: isoNow
        });
      } catch (err) {
        console.error("Failed to update task checklist in Firestore:", err);
      }
    }
  };

  const addIntegrationHistory = async (
    taskId: string,
    item: Omit<IntegrationHistoryItem, 'id' | 'executedAt'>
  ) => {
    const isoNow = new Date().toISOString();
    const newItem: IntegrationHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString().slice(-4),
      executedAt: isoNow
    };

    // Update local state immediately
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === taskId) {
          const history = t.integrationHistory ? [...t.integrationHistory, newItem] : [newItem];
          return { ...t, integrationHistory: history, updatedAt: isoNow };
        }
        return t;
      });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });

    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
          integrationHistory: arrayUnion(newItem),
          updatedAt: isoNow
        });
      } catch (err) {
        console.error("Failed to append integration history in Firestore:", err);
      }
    }
  };

  return {
    tasks,
    activeTask,
    activeTaskId,
    isCreatingNew,
    tasksLoading,
    createTask,
    deleteTask,
    selectTask: (id: string) => { setActiveTaskId(id); setIsCreatingNew(false); },
    startNewTask: () => { setActiveTaskId(null); setIsCreatingNew(true); },
    updateTaskProgress,
    updateTaskPlan,
    updateTaskChecklist,
    addIntegrationHistory,
  };
}

