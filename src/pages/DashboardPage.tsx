import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  Zap, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import Sidebar from "../components/layout/Sidebar";
import { useDashboardStats } from "../hooks/useDashboardStats";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { tasks, selectTask, deleteTask, startNewTask } = useTasks(user?.uid || null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    activePlans,
    completionRate,
    topicsStudied,
    streak,
    deadlines,
    trendData,
    maxTotalTrend,
    totalTopics,
    criticalPercent,
    highPercent,
    mediumPercent,
    criticalCount,
    highCount,
    mediumCount
  } = useDashboardStats(tasks);

  return (
    <div id="dashboard-page-root" className="w-full flex min-h-[calc(100vh-80px)]">
      
      {/* Backdrop overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          id="dashboard-sidebar-backdrop"
          className="sidebar-backdrop visible"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR INTEGRATION */}
      <Sidebar
        tasks={tasks}
        activeTaskId={null}
        isCreatingNew={false}
        onSelectTask={(id) => {
          navigate(`/?select_task=${id}`);
        }}
        onDeleteTask={deleteTask}
        onNewTask={() => {
          navigate("/?new_task=true");
        }}
        isOpen={isSidebarOpen}
      />

      {/* DASHBOARD CONTENT AREA */}
      <main id="dashboard-main-content" className="flex-1 w-full min-w-0 p-6 md:p-8 pb-16">
        
        {/* Mobile sidebar toggle button */}
        <button
          id="dashboard-sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="sidebar-mobile-toggle md:hidden fixed top-[76px] left-3 z-[100] bg-[#12121a] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer hover:bg-white/5 transition-colors"
        >
          ☰
        </button>

        {/* HEADER */}
        <div id="dashboard-header-block" className="mb-8">
          <h1 id="dashboard-title" className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Your Execution Overview
          </h1>
          <p id="dashboard-subtitle" className="text-slate-400 text-xs md:text-sm">
            Real-time insights and analytics across your execution strategies.
          </p>
        </div>

        {/* STATS CARDS GRID */}
        <div id="dashboard-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Active Plans */}
          <div 
            id="stat-card-active-plans"
            className="rounded-xl p-5 border flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.06)"
            }}
          >
            <div id="stat-label-active-plans" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Active Strategies
            </div>
            <div className="flex items-baseline justify-between">
              <div id="stat-val-active-plans" className="text-2xl md:text-3xl font-bold text-white font-mono leading-none">
                {activePlans}
              </div>
              <div id="stat-icon-active-plans" className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Completion Rate */}
          <div 
            id="stat-card-completion-rate"
            className="rounded-xl p-5 border flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.06)"
            }}
          >
            <div id="stat-label-completion-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Completion Rate
            </div>
            <div className="flex items-baseline justify-between">
              <div id="stat-val-completion-rate" className="text-2xl md:text-3xl font-bold text-white font-mono leading-none">
                {completionRate}%
              </div>
              <div id="stat-icon-completion-rate" className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Topics Studied */}
          <div 
            id="stat-card-topics-studied"
            className="rounded-xl p-5 border flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.06)"
            }}
          >
            <div id="stat-label-topics-studied" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Focus Areas Covered
            </div>
            <div className="flex items-baseline justify-between">
              <div id="stat-val-topics-studied" className="text-2xl md:text-3xl font-bold text-white font-mono leading-none">
                {topicsStudied}
              </div>
              <div id="stat-icon-topics-studied" className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: Day Streak */}
          <div 
            id="stat-card-day-streak"
            className="rounded-xl p-5 border flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.06)"
            }}
          >
            <div id="stat-label-day-streak" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Day Streak
            </div>
            <div className="flex items-baseline justify-between">
              <div id="stat-val-day-streak" className="text-2xl md:text-3xl font-bold text-white font-mono leading-none">
                {streak}
              </div>
              <div id="stat-icon-day-streak" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>

        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div id="dashboard-bento-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT PANEL: UPCOMING DEADLINES */}
          <div 
            id="dashboard-panel-upcoming-deadlines"
            className="p-6 rounded-2xl border border-white/5 bg-[#0f0f15]/40 flex flex-col gap-4"
          >
            <h2 id="upcoming-deadlines-title" className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Upcoming Deadlines
            </h2>

            {deadlines.length > 0 ? (
              <div id="deadlines-list" className="flex flex-col gap-3">
                {deadlines.map(({ task, timeRemaining }) => {
                  let badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  if (!timeRemaining.isPast) {
                    if (timeRemaining.totalHours <= 24) {
                      badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";
                    } else if (timeRemaining.totalHours <= 72) {
                      badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                    }
                  }

                  let displayStr = "";
                  if (timeRemaining.isPast) {
                    displayStr = "Completed";
                  } else if (timeRemaining.days > 0) {
                    displayStr = `${timeRemaining.days}d ${timeRemaining.hours}h left`;
                  } else if (timeRemaining.hours > 0) {
                    displayStr = `${timeRemaining.hours}h left`;
                  } else {
                    displayStr = "Today";
                  }

                  return (
                    <div
                      key={task.id}
                      id={`upcoming-deadline-row-${task.id}`}
                      onClick={() => navigate(`/?select_task=${task.id}`)}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
                        <span id={`deadline-row-title-${task.id}`} className="text-slate-200 font-semibold text-sm leading-snug group-hover:text-white transition-colors truncate">
                          {task.title}
                        </span>
                        <span id={`deadline-row-desc-${task.id}`} className="text-xs text-slate-500 leading-normal line-clamp-1">
                          {task.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span id={`deadline-row-badge-${task.id}`} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
                          {displayStr}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (
              <div id="no-deadlines-empty-state" className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <span className="text-3xl mb-3">📅</span>
                <p className="text-slate-300 font-semibold text-sm mb-1">No active deadlines</p>
                <p className="text-slate-500 text-xs mb-4">Start describing your upcoming challenges and build strategic plans.</p>
                <button
                  onClick={() => navigate("/?new_task=true")}
                  className="px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-[#a78bfa] text-xs font-medium cursor-pointer transition-all flex items-center gap-2"
                >
                  Create Strategy <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: EXECUTION PROGRESS */}
          <div 
            id="dashboard-panel-execution-progress"
            className="p-6 rounded-2xl border border-white/5 bg-[#0f0f15]/40 flex flex-col gap-4"
          >
            <h2 id="execution-progress-title" className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
              Execution Progress
            </h2>

            {tasks.length > 0 ? (
              <div id="progress-list" className="flex flex-col gap-4">
                {tasks.map(t => {
                  const taskTotalDays = t.plan?.dailyPlan?.length || 0;
                  const taskCompletedDays = t.dayStatuses?.filter(d => d.status === 'complete').length || 0;
                  const percent = taskTotalDays > 0 ? Math.round((taskCompletedDays / taskTotalDays) * 100) : 0;

                  return (
                    <div 
                      key={t.id} 
                      id={`progress-row-${t.id}`}
                      onClick={() => navigate(`/?select_task=${t.id}`)}
                      className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-purple-500/15 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span id={`progress-row-title-${t.id}`} className="text-slate-200 font-semibold truncate max-w-[70%]">
                          {t.title}
                        </span>
                        <span id={`progress-row-percent-${t.id}`} className="text-purple-400 font-bold font-mono">
                          {percent}% ({taskCompletedDays}/{taskTotalDays} days)
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div id={`progress-bar-bg-${t.id}`} className="w-full h-1.5 rounded-full bg-[#16161e] overflow-hidden">
                        <div 
                          id={`progress-bar-fill-${t.id}`}
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div id="no-progress-empty-state" className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <span className="text-3xl mb-3">📈</span>
                <p className="text-slate-300 font-semibold text-sm mb-1">No progress charts yet</p>
                <p className="text-slate-500 text-xs">Progress bars will track your completed and missed milestones here.</p>
              </div>
            )}
          </div>

          {/* LOWER LEFT: COMPLETION TREND */}
          <div 
            id="dashboard-panel-completion-trend"
            className="p-6 rounded-2xl border border-white/5 bg-[#0f0f15]/40 flex flex-col gap-5"
          >
            <div>
              <h2 id="completion-trend-title" className="text-lg font-bold text-white mb-1">Completion Trend</h2>
              <p id="completion-trend-desc" className="text-slate-500 text-xs">Activity logs for the last 7 days stacking completed vs. missed sessions.</p>
            </div>

            {/* Vertical Stack Bar Chart */}
            <div id="trend-chart-container" className="flex items-end justify-between h-40 pt-4 px-2 border-b border-white/5">
              {trendData.map((data, idx) => {
                const totalCount = data.completed + data.missed;
                const heightPercent = totalCount > 0 ? Math.round((totalCount / maxTotalTrend) * 100) : 0;
                const completedRatio = totalCount > 0 ? (data.completed / totalCount) * 100 : 0;
                const missedRatio = totalCount > 0 ? (data.missed / totalCount) * 100 : 0;
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isToday = data.dateStr === todayStr;

                return (
                  <div key={idx} id={`trend-column-wrapper-${idx}`} className="relative flex flex-col justify-end items-center h-full flex-1 group cursor-default">
                    
                    {/* Tooltip on hover */}
                    <div
                      id={`trend-tooltip-${idx}`}
                      className="opacity-0 group-hover:opacity-100 absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-950 text-slate-200 border border-white/10 text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl transition-opacity duration-200 pointer-events-none z-30 flex flex-col gap-0.5 font-mono whitespace-nowrap"
                    >
                      <span className="font-bold text-white">{data.dateStr}</span>
                      <span className="text-emerald-400">✓ Completed: {data.completed}</span>
                      <span className="text-red-400">✗ Missed: {data.missed}</span>
                    </div>

                    {/* Bar Container to isolate percentage calculations */}
                    <div className="w-full flex-1 flex flex-col justify-end items-center min-h-0">
                      {/* Stacked bar */}
                      <div
                        id={`trend-bar-${idx}`}
                        className={`w-7 sm:w-9 rounded-t-md overflow-hidden flex flex-col transition-all duration-500 ${isToday ? 'ring-1 ring-white/20' : ''}`}
                        style={{
                          height: totalCount > 0 ? `${Math.max(heightPercent, 14)}%` : '6px',
                          background: totalCount > 0 ? undefined : 'rgba(255,255,255,0.07)',
                          borderRadius: totalCount > 0 ? undefined : '2px',
                        }}
                      >
                        {totalCount > 0 ? (
                          <>
                            <div
                              id={`trend-bar-completed-${idx}`}
                              className="bg-emerald-500 w-full transition-all duration-150"
                              style={{ height: `${completedRatio}%` }}
                              title={`${data.completed} Completed`}
                            />
                            <div
                              id={`trend-bar-missed-${idx}`}
                              className="bg-red-500 w-full transition-all duration-150"
                              style={{ height: `${missedRatio}%` }}
                              title={`${data.missed} Missed`}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>


                    {/* Day Label */}
                    <span
                      id={`trend-label-${idx}`}
                      className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 font-mono transition-colors ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}
                    >
                      {data.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div id="trend-legend" className="flex items-center gap-4 text-xs justify-center pt-2 font-mono">
              <div id="legend-completed" className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed
              </div>
              <div id="legend-missed" className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Missed
              </div>
            </div>
          </div>

          {/* LOWER RIGHT: TOPIC DISTRIBUTION */}
          <div 
            id="dashboard-panel-topic-distribution"
            className="p-6 rounded-2xl border border-white/5 bg-[#0f0f15]/40 flex flex-col gap-5"
          >
            <div>
              <h2 id="topic-distribution-title" className="text-lg font-bold text-white mb-1">Target Area Distribution</h2>
              <p id="topic-distribution-desc" className="text-slate-500 text-xs">Breakdown of target areas aggregated by importance levels across your strategies.</p>
            </div>

            {totalTopics > 0 ? (
              <div id="distribution-progress-bars" className="flex flex-col gap-5 justify-center py-2">
                
                {/* Critical Topics */}
                <div id="distribution-row-critical" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Critical Importance
                    </span>
                    <span id="distribution-percent-critical" className="text-slate-400 font-bold font-mono">
                      {criticalPercent}% ({criticalCount} areas)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#16161e] overflow-hidden">
                    <div 
                      id="distribution-bar-critical"
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500"
                      style={{ width: `${criticalPercent}%` }}
                    />
                  </div>
                </div>

                {/* High Topics */}
                <div id="distribution-row-high" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      High Importance
                    </span>
                    <span id="distribution-percent-high" className="text-slate-400 font-bold font-mono">
                      {highPercent}% ({highCount} areas)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#16161e] overflow-hidden">
                    <div 
                      id="distribution-bar-high"
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                      style={{ width: `${highPercent}%` }}
                    />
                  </div>
                </div>

                {/* Medium Topics */}
                <div id="distribution-row-medium" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Medium Importance
                    </span>
                    <span id="distribution-percent-medium" className="text-slate-400 font-bold font-mono">
                      {mediumPercent}% ({mediumCount} areas)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#16161e] overflow-hidden">
                    <div 
                      id="distribution-bar-medium"
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${mediumPercent}%` }}
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div id="no-distribution-empty-state" className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <span className="text-3xl mb-3">🎯</span>
                <p className="text-slate-300 font-semibold text-sm mb-1">No target areas registered</p>
                <p className="text-slate-500 text-xs">Once you create an execution strategy, your aggregated target areas will be compiled here.</p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
