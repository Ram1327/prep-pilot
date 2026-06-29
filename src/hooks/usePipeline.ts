import React, { useState, useRef, useEffect } from 'react';
import { PrepPlan } from '../types/plan';
import { AgentStatus } from '../types/agent';

export interface SimpleTodoResult {
  taskSummary: string;
  enhancedPrompt: string;
  integrationRationale: string;
}

export interface UsePipelineReturn {
  generatePlan: (description: string) => void;
  isGenerating: boolean;
  pipelineAgents: AgentStatus[];
  result: PrepPlan | null;
  setResult: React.Dispatch<React.SetStateAction<PrepPlan | null>>;
  simpleTodoResult: SimpleTodoResult | null;
  clearSimpleTodo: () => void;
  error: string | null;
  clearResult: () => void;
}

export function usePipeline(): UsePipelineReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrepPlan | null>(null);
  const [simpleTodoResult, setSimpleTodoResult] = useState<SimpleTodoResult | null>(null);
  
  const [pipelineAgents, setPipelineAgents] = useState<AgentStatus[]>([
    { name: "prompt-intelligence", displayName: "Prompt Intelligence", status: "pending", message: "Awaiting activation" },
    { name: "intake", displayName: "Intake Agent", status: "pending", message: "Awaiting activation" },
    { name: "planning", displayName: "Planning Agent", status: "pending", message: "Awaiting activation" },
    { name: "research", displayName: "Research Agent", status: "pending", message: "Awaiting activation" },
    { name: "reasoning", displayName: "Reasoning Agent", status: "pending", message: "Awaiting activation" },
    { name: "actions-a", displayName: "Action Agent: Communication", status: "pending", message: "Awaiting activation" },
    { name: "actions-b", displayName: "Action Agent: Planning", status: "pending", message: "Awaiting activation" },
    { name: "actions-c", displayName: "Action Agent: Presentation", status: "pending", message: "Awaiting activation" }
  ]);

  const backupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearResult = () => {
    setResult(null);
    setError(null);
    setSimpleTodoResult(null);
    setIsGenerating(false);
  };

  const clearSimpleTodo = () => {
    setSimpleTodoResult(null);
    setError(null);
    setIsGenerating(false);
  };

  const generatePlan = (description: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setSimpleTodoResult(null);

    // Reset pipeline agents — prompt-intelligence is always present
    setPipelineAgents([
      { name: "prompt-intelligence", displayName: "Prompt Intelligence", status: "pending", message: "Awaiting activation" },
      { name: "intake", displayName: "Intake Agent", status: "pending", message: "Awaiting activation" },
      { name: "planning", displayName: "Planning Agent", status: "pending", message: "Awaiting activation" },
      { name: "research", displayName: "Research Agent", status: "pending", message: "Awaiting activation" },
      { name: "reasoning", displayName: "Reasoning Agent", status: "pending", message: "Awaiting activation" },
      { name: "actions-a", displayName: "Action Agent: Communication", status: "pending", message: "Awaiting activation" },
      { name: "actions-b", displayName: "Action Agent: Planning", status: "pending", message: "Awaiting activation" },
      { name: "actions-c", displayName: "Action Agent: Presentation", status: "pending", message: "Awaiting activation" }
    ]);

    const url = `/api/generate-plan-stream?description=${encodeURIComponent(description)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // 3 minutes backup timeout
    backupTimeoutRef.current = setTimeout(() => {
      setIsGenerating(false);
      setError("Plan generation timed out. Please try again.");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }, 180000);

    eventSource.addEventListener("agent-start", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setPipelineAgents((prev) =>
          prev.map((agent) =>
            agent.name === data.agent
              ? { ...agent, status: "running", message: data.message }
              : agent
          )
        );
      } catch (err) {
        console.error("Error parsing agent-start event", err);
      }
    });

    eventSource.addEventListener("agent-complete", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // When Prompt Intelligence completes, trim agents that won't be needed
        if (data.agent === 'prompt-intelligence' && data.result?.requiredIntegrations) {
          const required: string[] = data.result.requiredIntegrations;
          const needsA = required.includes('gmail') || required.includes('meet');
          const needsB = required.includes('calendar') || required.includes('docs');
          const needsC = required.includes('slides');
          setPipelineAgents((prev) =>
            prev
              .filter(agent => {
                if (agent.name === 'actions-a' && !needsA) return false;
                if (agent.name === 'actions-b' && !needsB) return false;
                if (agent.name === 'actions-c' && !needsC) return false;
                return true;
              })
              .map(agent =>
                agent.name === data.agent
                  ? { ...agent, status: "complete", message: `Selected integrations: ${required.join(', ')}` }
                  : agent
              )
          );
        } else {
          setPipelineAgents((prev) =>
            prev.map((agent) =>
              agent.name === data.agent
                ? { ...agent, status: "complete", message: "Task completed successfully" }
                : agent
            )
          );
        }
      } catch (err) {
        console.error("Error parsing agent-complete event", err);
      }
    });

    // Simple todo fast-path: server classified the input as a reminder/chore,
    // skipped the full pipeline, and returned just a calendar event suggestion.
    eventSource.addEventListener("simple_task", (event: MessageEvent) => {
      if (backupTimeoutRef.current) clearTimeout(backupTimeoutRef.current);
      try {
        const data: SimpleTodoResult = JSON.parse(event.data);
        setSimpleTodoResult(data);
        setIsGenerating(false);
        eventSource.close();
      } catch (err) {
        console.error("Error parsing simple_task event", err);
        setIsGenerating(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener("complete", (event: MessageEvent) => {
      if (backupTimeoutRef.current) {
        clearTimeout(backupTimeoutRef.current);
      }
      try {
        const data = JSON.parse(event.data);
        const finalPlan: PrepPlan = data.result;
        setResult(finalPlan);
        setIsGenerating(false);
        eventSource.close();
      } catch (err) {
        console.error("Error parsing complete event", err);
        setError("Failed to parse completion results.");
        setIsGenerating(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener("error", (event: any) => {
      if (backupTimeoutRef.current) {
        clearTimeout(backupTimeoutRef.current);
      }
      let errorMsg = "Failed to establish server connection. Please try again.";
      try {
        if (event.data) {
          const data = JSON.parse(event.data);
          errorMsg = data.message || errorMsg;
        }
      } catch (e) {
        // Fallback
      }
      setError(errorMsg);
      setPipelineAgents((prev) =>
        prev.map((agent) =>
          agent.status === "running" ? { ...agent, status: "error", message: "Failed" } : agent
        )
      );
      setIsGenerating(false);
      eventSource.close();
    });
  };

  useEffect(() => {
    return () => {
      if (backupTimeoutRef.current) clearTimeout(backupTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return {
    generatePlan,
    isGenerating,
    pipelineAgents,
    result,
    setResult,
    simpleTodoResult,
    clearSimpleTodo,
    error,
    clearResult,
  };
}
