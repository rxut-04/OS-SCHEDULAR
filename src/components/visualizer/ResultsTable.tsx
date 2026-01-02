"use client";

import { Process } from '@/lib/algorithms/types';

interface ResultsTableProps {
  processes: Process[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export function ResultsTable({ processes, avgWaitingTime, avgTurnaroundTime }: ResultsTableProps) {
  return (
    <div className="glass-effect rounded-xl p-4 sm:p-6 animate-fade-in">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[var(--text-primary)]">
        Results
      </h3>

      <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
        <table className="w-full text-xs sm:text-sm min-w-[320px]">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">Process</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">AT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">BT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">CT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">TAT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-[var(--text-secondary)]">WT</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(process => (
              <tr 
                key={process.id} 
                className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <td className="py-2 sm:py-3 px-1 sm:px-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div 
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: process.color }}
                    />
                    <span className="font-mono font-medium text-xs sm:text-sm">{process.id}</span>
                  </div>
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono">{process.arrivalTime}</td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono">{process.burstTime}</td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-[var(--accent-primary)]">
                  {process.completionTime}
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-[var(--accent-secondary)]">
                  {process.turnaroundTime}
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-[var(--accent-tertiary)]">
                  {process.waitingTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--border-color)]">
        <div className="p-3 sm:p-4 rounded-lg bg-[var(--accent-secondary)]/10 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5 sm:mb-1">
            Avg TAT
          </p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-[var(--accent-secondary)]">
            {avgTurnaroundTime.toFixed(2)}
          </p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-[var(--accent-tertiary)]/10 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5 sm:mb-1">
            Avg WT
          </p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-[var(--accent-tertiary)]">
            {avgWaitingTime.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-[var(--bg-tertiary)] text-[10px] sm:text-xs text-[var(--text-muted)]">
        <p><strong>AT</strong> = Arrival | <strong>BT</strong> = Burst | <strong>CT</strong> = Completion</p>
        <p><strong>TAT</strong> = Turnaround | <strong>WT</strong> = Waiting</p>
      </div>
    </div>
  );
}
