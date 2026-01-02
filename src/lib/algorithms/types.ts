export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  remainingTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  color: string;
}

export interface GanttBlock {
  processId: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface SchedulingResult {
  ganttChart: GanttBlock[];
  processes: Process[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  time: number;
  action: string;
  processId: string | null;
  reason: string;
  readyQueue: string[];
}

export const PROCESS_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];
