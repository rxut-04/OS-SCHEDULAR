"use client";

import { ExecutionStep, Process } from '@/lib/algorithms/types';

interface StepExplanationProps {
  steps: ExecutionStep[];
  currentStep: number;
  processes: Process[];
}

export function StepExplanation({ steps, currentStep, processes }: StepExplanationProps) {
  const getProcessColor = (processId: string | null) => {
    if (!processId) return 'var(--text-muted)';
    const process = processes.find(p => p.id === processId);
    return process?.color || 'var(--accent-primary)';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="glass-effect rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Step-by-Step Explanation
        </h3>
        <span className="px-3 py-1 rounded-full text-sm font-mono bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      {currentStepData ? (
        <div className="space-y-4">
          <div 
            className="p-4 rounded-lg border-l-4 animate-slide-in"
            style={{ 
              borderColor: getProcessColor(currentStepData.processId),
              backgroundColor: `${getProcessColor(currentStepData.processId)}10`
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                T = {currentStepData.time}
              </span>
              <span 
                className="font-semibold"
                style={{ color: getProcessColor(currentStepData.processId) }}
              >
                {currentStepData.action}
              </span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {currentStepData.reason}
            </p>
          </div>

          {currentStepData.readyQueue.length > 0 && (
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Ready Queue
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStepData.readyQueue.map(processId => (
                  <span 
                    key={processId}
                    className="px-3 py-1 rounded-full text-sm font-mono font-medium"
                    style={{ 
                      backgroundColor: `${getProcessColor(processId)}20`,
                      color: getProcessColor(processId)
                    }}
                  >
                    {processId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <p>Click &quot;Visualize&quot; to start the animation</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300
                ${index === currentStep ? 'w-6 bg-[var(--accent-primary)]' : 
                  index < currentStep ? 'bg-[var(--accent-tertiary)]' : 'bg-[var(--border-color)]'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
