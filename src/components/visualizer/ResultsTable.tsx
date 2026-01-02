"use client";

import { Process } from '@/lib/algorithms/types';

interface ResultsTableProps {
  processes: Process[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export function ResultsTable({ processes, avgWaitingTime, avgTurnaroundTime }: ResultsTableProps) {
  return (
    <div className="glass-effect rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
        Results
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-3 px-2 font-semibold text-[var(--text-secondary)]">Process</th>
              <th className="text-center py-3 px-2 font-semibold text-[var(--text-secondary)]">AT</th>
              <th className="text-center py-3 px-2 font-semibold text-[var(--text-secondary)]">BT</th>
              <th className="text-center py-3 px-2 font-semibold text-[var(--text-secondary)]">CT</th>
              <th className="text-center py-3 px-2 font-semibold text-[var(--text-secondary)]">TAT</th>
              <th className="text-center py-3 px-2 font-semibold text-[var(--text-secondary)]">WT</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(process => (
              <tr 
                key={process.id} 
                className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: process.color }}
                    />
                    <span className="font-mono font-medium">{process.id}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 font-mono">{process.arrivalTime}</td>
                <td className="text-center py-3 px-2 font-mono">{process.burstTime}</td>
                <td className="text-center py-3 px-2 font-mono text-[var(--accent-primary)]">
                  {process.completionTime}
                </td>
                <td className="text-center py-3 px-2 font-mono text-[var(--accent-secondary)]">
                  {process.turnaroundTime}
                </td>
                <td className="text-center py-3 px-2 font-mono text-[var(--accent-tertiary)]">
                  {process.waitingTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        <div className="p-4 rounded-lg bg-[var(--accent-secondary)]/10 text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Avg Turnaround Time
          </p>
          <p className="text-2xl font-bold font-mono text-[var(--accent-secondary)]">
            {avgTurnaroundTime.toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--accent-tertiary)]/10 text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Avg Waiting Time
          </p>
          <p className="text-2xl font-bold font-mono text-[var(--accent-tertiary)]">
            {avgWaitingTime.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)]">
        <p><strong>AT</strong> = Arrival Time | <strong>BT</strong> = Burst Time | <strong>CT</strong> = Completion Time</p>
        <p><strong>TAT</strong> = Turnaround Time (CT - AT) | <strong>WT</strong> = Waiting Time (TAT - BT)</p>
      </div>
    </div>
  );
}
