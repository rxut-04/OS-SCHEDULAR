"use client";

import { useEffect, useRef, useMemo } from 'react';
import { GanttBlock, ExecutionStep, Process } from '@/lib/algorithms/types';

interface GanttChartProps {
  ganttChart: GanttBlock[];
  steps: ExecutionStep[];
  processes: Process[];
  isPlaying: boolean;
  speed: number;
  onStepChange: (stepIndex: number) => void;
  currentStep: number;
}

export function GanttChart({ 
  ganttChart, 
  steps, 
  processes,
  isPlaying, 
  speed, 
  onStepChange,
  currentStep 
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeScale = 60;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onStepChange(currentStep + 1);
    }, 1500 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, speed, onStepChange]);

  const { animatedBlocks, currentExecutingBlock } = useMemo(() => {
    if (currentStep < 0) {
      return { animatedBlocks: new Set<number>(), currentExecutingBlock: -1 };
    }

    const animated = new Set<number>();
    let executing = -1;

    for (let i = 0; i <= currentStep; i++) {
      const stepData = steps[i];
      if (!stepData) continue;

      const blockIndex = ganttChart.findIndex(
        block => block.startTime === stepData.time || 
                 (stepData.action.includes('Completed') && block.endTime === stepData.time)
      );

      if (stepData.action.includes('Execute') && blockIndex >= 0) {
        animated.add(blockIndex);
        executing = blockIndex;
      } else if (stepData.action.includes('Completed')) {
        executing = -1;
      }
    }

    const lastStep = steps[currentStep];
    if (lastStep && !lastStep.action.includes('Execute')) {
      executing = -1;
    }

    return { animatedBlocks: animated, currentExecutingBlock: executing };
  }, [currentStep, steps, ganttChart]);

  const getProcessColor = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    return process?.color || '#6366f1';
  };

  return (
    <div className="glass-effect rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
        Gantt Chart
      </h3>
      
      <div 
        ref={containerRef}
        className="overflow-x-auto pb-4"
      >
        <div className="relative min-w-max">
          <div className="flex items-end gap-0.5 h-16 mb-2">
            {ganttChart.map((block, index) => {
              const width = (block.endTime - block.startTime) * timeScale;
              const isAnimated = animatedBlocks.has(index);
              const isExecuting = currentExecutingBlock === index;
              
              return (
                <div
                  key={index}
                  className={`
                    relative h-full rounded-md flex items-center justify-center
                    transition-all duration-500 ease-out
                    ${isAnimated ? 'opacity-100' : 'opacity-20'}
                    ${isExecuting ? 'animate-pulse-glow scale-105' : ''}
                  `}
                  style={{
                    width: `${width}px`,
                    backgroundColor: isAnimated ? getProcessColor(block.processId) : 'var(--bg-tertiary)',
                    minWidth: '40px',
                    transform: isAnimated ? 'scaleY(1)' : 'scaleY(0.7)',
                    boxShadow: isExecuting ? `0 0 20px ${getProcessColor(block.processId)}` : 'none',
                  }}
                >
                  <span className="text-white font-mono text-sm font-semibold drop-shadow-lg">
                    {block.processId}
                  </span>
                  {isExecuting && (
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-ping"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-0.5">
            {ganttChart.map((block, index) => {
              const width = (block.endTime - block.startTime) * timeScale;
              return (
                <div
                  key={index}
                  className="flex justify-between text-xs font-mono text-[var(--text-muted)]"
                  style={{ width: `${width}px`, minWidth: '40px' }}
                >
                  <span>{block.startTime}</span>
                  {index === ganttChart.length - 1 && (
                    <span>{block.endTime}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
        {processes.map(process => (
          <div 
            key={process.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ backgroundColor: `${process.color}20` }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: process.color }}
            />
            <span className="font-mono font-medium" style={{ color: process.color }}>
              {process.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
