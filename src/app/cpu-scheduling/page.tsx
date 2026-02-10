"use client";

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/ui/shaders-hero-section';
import { TheorySection } from '@/components/ui/theory-section';
import { Process, SchedulingResult } from '@/lib/algorithms/types';
import { fcfs, sjf, roundRobin, priorityScheduling } from '@/lib/algorithms';
import { ProcessInputForm } from '@/components/visualizer/ProcessInputForm';
import { GanttChart } from '@/components/visualizer/GanttChart';
import { StepExplanation } from '@/components/visualizer/StepExplanation';
import { ResultsTable } from '@/components/visualizer/ResultsTable';
import { ControlPanel } from '@/components/visualizer/ControlPanel';
import { ComparisonChart } from '@/components/visualizer/ComparisonChart';

const ALGORITHMS = [
  { id: 'fcfs', name: 'FCFS', fullName: 'First Come First Serve', description: 'Processes are executed in the order they arrive' },
  { id: 'sjf', name: 'SJF', fullName: 'Shortest Job First', description: 'Process with shortest burst time executes first' },
  { id: 'round-robin', name: 'RR', fullName: 'Round Robin', description: 'Each process gets a fixed time quantum' },
  { id: 'priority', name: 'Priority', fullName: 'Priority Scheduling', description: 'Process with highest priority executes first' },
];

export default function CpuSchedulingPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('sjf');
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [inputProcesses, setInputProcesses] = useState<Process[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [timeQuantum, setTimeQuantum] = useState(2);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const runAlgorithm = useCallback((processes: Process[], tq?: number) => {
    setInputProcesses(processes);
    if (tq) setTimeQuantum(tq);
    let schedulingResult: SchedulingResult;

    switch (selectedAlgorithm) {
      case 'fcfs':
        schedulingResult = fcfs(processes);
        break;
      case 'sjf':
        schedulingResult = sjf(processes);
        break;
      case 'round-robin':
        schedulingResult = roundRobin(processes, tq || 2);
        break;
      case 'priority':
        schedulingResult = priorityScheduling(processes);
        break;
      default:
        schedulingResult = sjf(processes);
    }

    setResult(schedulingResult);
    setCurrentStep(-1);
    setIsPlaying(false);
  }, [selectedAlgorithm]);

  const handleStepChange = useCallback((step: number) => {
    if (!result) return;
    if (step >= result.steps.length) {
      setIsPlaying(false);
      setCurrentStep(result.steps.length - 1);
      return;
    }
    if (step < 0) {
      setCurrentStep(-1);
      return;
    }
    setCurrentStep(step);
  }, [result]);

  const handlePlayPause = useCallback(() => {
    if (!result) return;
    if (currentStep >= result.steps.length - 1) {
      setCurrentStep(-1);
    }
    setIsPlaying(prev => !prev);
  }, [result, currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(-1);
    setIsPlaying(false);
  }, []);

  const currentAlgo = ALGORITHMS.find(a => a.id === selectedAlgorithm);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--alg-bg)" }}>
      <div className="relative z-10">
        <Header
          title="CPU Scheduling Algorithms"
          description="Select an algorithm, enter process data, and visualize step-by-step execution"
        />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="mb-6">
            <TheorySection title="Theory: CPU Scheduling" defaultOpen={false}>
              <p><strong>CPU scheduling</strong> is the process by which the operating system decides which process in the ready queue gets the CPU next. The goal is to maximize CPU utilization and throughput while minimizing waiting time and response time.</p>
              <p><strong>FCFS (First Come First Serve):</strong> Processes are executed in the order they arrive. Non-preemptive; simple but can cause long waiting times (convoy effect).</p>
              <p><strong>SJF (Shortest Job First):</strong> The process with the smallest burst time runs next. Can be preemptive (SRTF) or non-preemptive. Minimizes average waiting time but requires knowing burst times.</p>
              <p><strong>Round Robin:</strong> Each process gets a fixed time quantum. Preemptive; fair and good for time-sharing. Performance depends on quantum size.</p>
              <p><strong>Priority Scheduling:</strong> Each process has a priority; higher-priority processes run first. Can be preemptive or non-preemptive. May cause starvation for low-priority processes.</p>
            </TheorySection>
          </div>
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3" style={{ color: "var(--alg-text)" }}>
              CPU Scheduling Algorithms
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Select an algorithm, enter process data, and visualize step-by-step execution
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10">
            {ALGORITHMS.map(algo => (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  setResult(null);
                  setCurrentStep(-1);
                }}
                className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 text-left border"
                style={{
                  ...(selectedAlgorithm === algo.id
                    ? { background: "var(--alg-mint)", color: "var(--alg-primary)", borderColor: "var(--alg-secondary)" }
                    : { background: "var(--alg-white)", color: "var(--text-secondary)", borderColor: "var(--border-color)" }),
                }}
              >
                <span className="block font-semibold text-sm sm:text-base">{algo.name}</span>
                <span className="text-[10px] sm:text-xs opacity-70 hidden sm:block mt-1">{algo.fullName}</span>
              </button>
            ))}
          </div>

          {currentAlgo && (
            <div className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10 flex items-start gap-3 sm:gap-4 border" style={{ background: "var(--alg-white)", borderColor: "var(--border-color)" }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "var(--alg-mint)" }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--alg-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: "var(--alg-text)" }}>{currentAlgo.fullName}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{currentAlgo.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <ProcessInputForm 
              algorithm={selectedAlgorithm}
              onSubmit={runAlgorithm}
            />
          </div>

<div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {result ? (
                <>
                  <ControlPanel
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                    onStepForward={() => handleStepChange(currentStep + 1)}
                    onStepBackward={() => handleStepChange(currentStep - 1)}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    canStepForward={currentStep < result.steps.length - 1}
                    canStepBackward={currentStep > 0}
                    hasResult={!!result}
                  />

                  <GanttChart
                      ganttChart={result.ganttChart}
                      steps={result.steps}
                      processes={inputProcesses}
                      isPlaying={isPlaying}
                      speed={speed}
                      onStepChange={handleStepChange}
                      currentStep={currentStep}
                      algorithm={currentAlgo?.fullName}
                    />

                  <ComparisonChart 
                    processes={inputProcesses}
                    timeQuantum={timeQuantum}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <StepExplanation
                      steps={result.steps}
                      currentStep={currentStep}
                      processes={inputProcesses}
                    />
                    <ResultsTable
                      processes={result.processes}
                      avgWaitingTime={result.avgWaitingTime}
                      avgTurnaroundTime={result.avgTurnaroundTime}
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl p-8 sm:p-12 text-center border" style={{ background: "var(--alg-white)", borderColor: "var(--border-color)" }}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center border" style={{ background: "var(--alg-bg)", borderColor: "var(--border-color)" }}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: "var(--alg-text)" }}>
                    Ready to Visualize
                  </h3>
                  <p className="text-sm sm:text-base max-w-md mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Enter process details on the left and click &quot;Visualize Algorithm&quot; to see the scheduling in action
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-8 sm:mt-16 py-6 sm:py-8 border-t" style={{ borderColor: "var(--border-color)", background: "var(--alg-white)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <p>AlgoLogic - Mastering OS &amp; AI</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
