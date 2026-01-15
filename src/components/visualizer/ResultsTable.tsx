"use client";

import { Process } from '@/lib/algorithms/types';

interface ResultsTableProps {
  processes: Process[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export function ResultsTable({ processes, avgWaitingTime, avgTurnaroundTime }: ResultsTableProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 animate-fade-in">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
        Results
      </h3>

      <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
        <table className="w-full text-xs sm:text-sm min-w-[320px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">Process</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">AT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">BT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">CT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">TAT</th>
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-white/60">WT</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(process => (
              <tr 
                key={process.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-2 sm:py-3 px-1 sm:px-2 text-white">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div 
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: process.color }}
                    />
                    <span className="font-mono font-medium text-xs sm:text-sm">{process.id}</span>
                  </div>
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-white/80">{process.arrivalTime}</td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-white/80">{process.burstTime}</td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-blue-400">
                  {process.completionTime}
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-purple-400">
                  {process.turnaroundTime}
                </td>
                <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-mono text-emerald-400">
                  {process.waitingTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
        <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mb-0.5 sm:mb-1">
            Avg TAT
          </p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-purple-400">
            {avgTurnaroundTime.toFixed(2)}
          </p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-emerald-500/10 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mb-0.5 sm:mb-1">
            Avg WT
          </p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
            {avgWaitingTime.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-white/5 text-[10px] sm:text-xs text-white/40">
        <p><strong>AT</strong> = Arrival | <strong>BT</strong> = Burst | <strong>CT</strong> = Completion</p>
        <p><strong>TAT</strong> = Turnaround | <strong>WT</strong> = Waiting</p>
      </div>
    </div>
  );
}
