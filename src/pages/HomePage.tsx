import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/ui/Toast";
import Sidebar from "../components/layout/Sidebar";
import LandingPage from "../components/layout/LandingPage";
import { CalendarCheck, ArrowRight, Sparkles } from "lucide-react";

// Custom hooks
import { usePipeline } from "../hooks/usePipeline";
import { usePlanProgress } from "../hooks/usePlanProgress";
import { useTasks } from "../hooks/useTasks";
import { useAuthContext } from "../context/AuthContext";

// Decomposed views
import NewStrategyView from "../components/home/NewStrategyView";
import StrategyDetailView from "../components/home/StrategyDetailView";
import EmptyStrategyView from "../components/home/EmptyStrategyView";

export default function HomePage() {
  const { user, googleAccessToken, signInWithGoogle } = useAuthContext();
  const [currentDescription, setCurrentDescription] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [sharedPlanData, setSharedPlanData] = useState<any | null>(null);
  const [sharedPlanLoading, setSharedPlanLoading] = useState(false);

  const {
    tasks,
    activeTask,
    activeTaskId,
    isCreatingNew,
    createTask,
    selectTask,
    deleteTask,
    startNewTask,
    updateTaskProgress,
    updateTaskPlan,
    updateTaskChecklist,
    addIntegrationHistory,
  } = useTasks(user?.uid || null);

  const {
    generatePlan,
    isGenerating,
    pipelineAgents,
    result,
    error,
    clearResult,
    simpleTodoResult,
    clearSimpleTodo,
  } = usePipeline();

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Support viewing shared plans from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPlanId = params.get('shared_plan');
    const sharedUid = params.get('uid');
    
    if (sharedPlanId && sharedUid) {
      setSharedPlanLoading(true);
      import('firebase/firestore').then(async ({ doc, getDoc }) => {
        import('../lib/firebase').then(async ({ db }) => {
          try {
            const docRef = doc(db, 'users', sharedUid, 'tasks', sharedPlanId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setSharedPlanData({
                id: docSnap.id,
                ...data,
                sharedByUid: sharedUid
              });
              showToast("Reviewing shared strategic roadmap!", "success");
            } else {
              showToast("Shared plan not found or was removed.", "error");
            }
          } catch (e) {
            console.error("Error loading shared plan:", e);
            showToast("Could not retrieve shared strategic roadmap.", "error");
          } finally {
            setSharedPlanLoading(false);
          }
        });
      });
    }
  }, []);

  // Support selecting a task from query parameters (e.g. from Dashboard click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectTaskId = params.get('select_task');
    if (selectTaskId && tasks.length > 0) {
      const exists = tasks.some(t => t.id === selectTaskId);
      if (exists) {
        setSharedPlanData(null);
        selectTask(selectTaskId);
        // Clean up query param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [tasks, selectTask]);

  // Support starting a new task from query parameters (e.g. from Dashboard click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isNewTask = params.get('new_task');
    if (isNewTask === 'true') {
      setSharedPlanData(null);
      startNewTask();
      // Clean up query param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [startNewTask]);

  // Determine active plan's goal summary for progress tracking
  const displayTask = sharedPlanData || activeTask;
  const activePlan = isCreatingNew && !sharedPlanData ? result : (displayTask ? displayTask.plan : null);
  const planKey = activePlan?.goalSummary || "";

  const {
    dayStatuses,
    isReplanning,
    markDayComplete,
    markDayMissed,
  } = usePlanProgress(
    planKey,
    displayTask?.dayStatuses,
    displayTask?.id,
    (updatedStatuses) => {
      if (activeTask && !sharedPlanData) {
        updateTaskProgress(activeTask.id, updatedStatuses);
      }
    }
  );

  // When a plan finishes generating, save it as a new task
  useEffect(() => {
    if (result && isCreatingNew && currentDescription.trim().length >= 10) {
      createTask(currentDescription, result);
      setCurrentDescription("");
      clearResult();
    }
  }, [result, isCreatingNew, currentDescription]);

  // Smooth scroll to results once plan is compiled
  useEffect(() => {
    if (activePlan && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [activePlan]);

  const handleFormSubmit = (description: string) => {
    if (isGenerating) return;
    if (!description || description.trim().length < 10) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      showToast("Please describe your deadline or target topic in more detail (min 10 chars).", "error");
      return;
    }
    setCurrentDescription(description);
    generatePlan(description);
  };

  const handleSharePlan = () => {
    if (!activeTask) return;
    const shareUrl = `${window.location.origin}/?shared_plan=${activeTask.id}&uid=${user?.uid || ''}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Plan link copied to clipboard!', 'success');
  };

  if (!user && !sharedPlanData && !sharedPlanLoading) {
    return (
      <div className="w-full flex flex-col min-h-[calc(100vh-80px)]">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
        <LandingPage />
      </div>
    );
  }

  return (
    <div className="w-full flex min-h-[calc(100vh-80px)]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Backdrop overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop visible"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <Sidebar
        tasks={tasks}
        activeTaskId={activeTaskId}
        isCreatingNew={isCreatingNew && !sharedPlanData}
        onSelectTask={(id) => {
          setSharedPlanData(null);
          selectTask(id);
        }}
        onDeleteTask={deleteTask}
        onNewTask={() => {
          setSharedPlanData(null);
          startNewTask();
        }}
        isOpen={isSidebarOpen}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0 pb-16">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="sidebar-mobile-toggle md:hidden fixed top-[76px] left-3 z-[100] bg-[#12121a] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer hover:bg-white/5 transition-colors"
        >
          ☰
        </button>

        <div className="w-full px-4 pt-4 md:pt-0">
          {sharedPlanLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
              <div className="text-sm text-[var(--text-secondary)]">Retrieving shared strategic roadmap...</div>
            </div>
          )}

          {/* STATE A: Creating new plan — show hero + input form */}
          {isCreatingNew && !sharedPlanData && !sharedPlanLoading && (
            <>
              {/* Simple Todo Result — shown instead of full plan when task is a reminder/chore */}
              {simpleTodoResult && !isGenerating && (
                <div className="max-w-2xl mx-auto mt-8 animate-fadeIn">
                  <div className="p-6 bg-[var(--bg-card)] border border-white/10 rounded-2xl flex flex-col gap-5 shadow-lg">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                        <CalendarCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Simple Task Detected
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-white leading-snug">
                          {simpleTodoResult.taskSummary}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          This looks like a simple reminder rather than a prep task — PrepPilot works best for interviews, exams, presentations, and high-stakes deadlines.
                        </p>
                      </div>
                    </div>

                    {/* Suggestion */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What PrepPilot understood:</p>
                      <p className="text-sm text-slate-200 leading-relaxed">{simpleTodoResult.enhancedPrompt}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={clearSimpleTodo}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-900/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        Try a Real Prep Task
                      </button>
                      <button
                        onClick={clearSimpleTodo}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Start Over
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 text-center">
                      Tip: Try <span className="text-slate-300 font-medium">"job interview at Meta in 3 days"</span> or <span className="text-slate-300 font-medium">"AWS exam next week"</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Normal generation UI — hidden when simpleTodoResult is showing */}
              {!simpleTodoResult && (
                <NewStrategyView
                  isGenerating={isGenerating}
                  pipelineAgents={pipelineAgents}
                  error={error}
                  isShaking={isShaking}
                  onSubmit={handleFormSubmit}
                  onRetry={() => handleFormSubmit(currentDescription)}
                />
              )}
            </>
          )}

          {/* STATE B: Viewing an existing task or sharedPlanData */}
          {(!isCreatingNew || sharedPlanData) && displayTask && !sharedPlanLoading && (
            <StrategyDetailView
              displayTask={displayTask}
              sharedPlanData={sharedPlanData}
              user={user}
              addIntegrationHistory={addIntegrationHistory}
              dayStatuses={dayStatuses}
              isReplanning={isReplanning}
              googleAccessToken={googleAccessToken}
              signInWithGoogle={signInWithGoogle}
              handleSharePlan={handleSharePlan}
              onImportPlan={async () => {
                try {
                  await createTask(sharedPlanData.description || sharedPlanData.title || "Imported Strategy", sharedPlanData.plan);
                  setSharedPlanData(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                  showToast("Successfully imported execution strategy!", "success");
                } catch (e) {
                  showToast("Failed to import execution strategy.", "error");
                }
              }}
              onMarkComplete={markDayComplete}
              onMarkMissed={(dayIdx) => {
                if (sharedPlanData) {
                  showToast("Import the plan to modify task progress.", "info");
                  return;
                }
                markDayMissed(dayIdx, displayTask.plan, (updatedPlan) => {
                  updateTaskPlan(displayTask.id, updatedPlan);
                }, showToast);
              }}
              onActionsGenerated={(actions) => {
                if (sharedPlanData) {
                  setSharedPlanData((prev: any) => ({
                    ...prev,
                    plan: { ...prev.plan, smartActions: actions }
                  }));
                } else if (activeTask) {
                  updateTaskPlan(activeTask.id, {
                    ...activeTask.plan,
                    smartActions: actions
                  });
                }
              }}
              onToggleChecklist={(updatedChecklist) => {
                updateTaskChecklist(displayTask.id, updatedChecklist);
              }}
              resultsRef={resultsRef}
            />
          )}

          {/* STATE C: No tasks and not creating — fallback empty state */}
          {!isCreatingNew && !displayTask && !sharedPlanLoading && (
            <EmptyStrategyView onNewTask={startNewTask} />
          )}
        </div>
      </main>
    </div>
  );
}
