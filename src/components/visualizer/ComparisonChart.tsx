"use client";

import { useState, useMemo } from 'react';
import { Process } from '@/lib/algorithms/types';
import { fcfs, sjf, roundRobin, priorityScheduling } from '@/lib/algorithms';

interface ComparisonChartProps {
  processes: Process[];
  timeQuantum: number;
}

interface AlgorithmResult {
  id: string;
  name: string;
  avgTurnaroundTime: number;
  avgWaitingTime: number;
}

export function ComparisonChart({ processes, timeQuantum }: ComparisonChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ algo: string; type: 'tat' | 'wt' } | null>(null);

  const results = useMemo((): AlgorithmResult[] => {
    if (processes.length === 0) return [];

    const fcfsResult = fcfs(processes);
    const sjfResult = sjf(processes);
    const rrResult = roundRobin(processes, timeQuantum);
    const priorityResult = priorityScheduling(processes);

    return [
      { id: 'fcfs', name: 'FCFS', avgTurnaroundTime: fcfsResult.avgTurnaroundTime, avgWaitingTime: fcfsResult.avgWaitingTime },
      { id: 'rr', name: `RR`, avgTurnaroundTime: rrResult.avgTurnaroundTime, avgWaitingTime: rrResult.avgWaitingTime },
      { id: 'sjf', name: 'SJF', avgTurnaroundTime: sjfResult.avgTurnaroundTime, avgWaitingTime: sjfResult.avgWaitingTime },
      { id: 'priority', name: 'Pri', avgTurnaroundTime: priorityResult.avgTurnaroundTime, avgWaitingTime: priorityResult.avgWaitingTime },
    ];
  }, [processes, timeQuantum]);

  if (results.length === 0) return null;

  const maxValue = Math.max(
    ...results.map(r => Math.max(r.avgTurnaroundTime, r.avgWaitingTime))
  );

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-6 animate-fade-in">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[var(--text-primary)] flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Algorithm Comparison
      </h3>

      <div className="flex justify-center gap-3 sm:gap-6 mb-3 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 sm:w-4 h-0.5 bg-[#6366f1]" />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full border-2 border-[#6366f1] bg-transparent" />
          <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Avg TAT</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 sm:w-4 h-0.5 bg-[#ef4444]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444, #ef4444 4px, transparent 4px, transparent 8px)' }} />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#ef4444]" />
          <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Avg WT</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
        <div className="min-w-[280px] sm:min-w-[400px]">
          <div className="space-y-2 sm:space-y-3">
            {results.map((r) => {
              const tatWidth = (r.avgTurnaroundTime / (maxValue * 1.1)) * 100;
              const wtWidth = (r.avgWaitingTime / (maxValue * 1.1)) * 100;
              const isHoveredTat = hoveredPoint?.algo === r.name && hoveredPoint?.type === 'tat';
              const isHoveredWt = hoveredPoint?.algo === r.name && hoveredPoint?.type === 'wt';
              
              return (
                <div key={r.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] w-12 sm:w-16">{r.name}</span>
                    <div className="flex-1 space-y-1 ml-2 sm:ml-3">
                      <div 
                        className="relative h-4 sm:h-5 bg-[var(--bg-tertiary)] rounded overflow-hidden cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ algo: r.name, type: 'tat' })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div 
                          className="h-full bg-[#6366f1] rounded transition-all duration-300"
                          style={{ 
                            width: `${tatWidth}%`,
                            opacity: isHoveredTat ? 1 : 0.8 
                          }}
                        />
                        {isHoveredTat && (
                          <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-mono text-white">
                            {r.avgTurnaroundTime.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div 
                        className="relative h-4 sm:h-5 bg-[var(--bg-tertiary)] rounded overflow-hidden cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ algo: r.name, type: 'wt' })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div 
                          className="h-full bg-[#ef4444] rounded transition-all duration-300"
                          style={{ 
                            width: `${wtWidth}%`,
                            opacity: isHoveredWt ? 1 : 0.8 
                          }}
                        />
                        {isHoveredWt && (
                          <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-mono text-white">
                            {r.avgWaitingTime.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--border-color)]">
        {results.map(r => (
          <div 
            key={r.id}
            className="p-2 sm:p-3 rounded-lg bg-[var(--bg-tertiary)] text-center"
          >
            <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-2">{r.name}</p>
            <p className="text-[10px] sm:text-xs text-[#6366f1]">TAT: {r.avgTurnaroundTime.toFixed(2)}</p>
            <p className="text-[10px] sm:text-xs text-[#ef4444]">WT: {r.avgWaitingTime.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
