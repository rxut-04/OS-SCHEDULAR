import { Process, GanttBlock, SchedulingResult, ExecutionStep } from './types';

export function fcfs(processes: Process[]): SchedulingResult {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const ganttChart: GanttBlock[] = [];
  const steps: ExecutionStep[] = [];
  let currentTime = 0;

  const completedProcesses: Process[] = [];

  for (const process of sortedProcesses) {
    if (currentTime < process.arrivalTime) {
      steps.push({
        time: currentTime,
        action: 'CPU Idle',
        processId: null,
        reason: `No process available. Waiting for ${process.id} to arrive at time ${process.arrivalTime}.`,
        readyQueue: [],
      });
      currentTime = process.arrivalTime;
    }

    const readyQueue = sortedProcesses
      .filter(p => p.arrivalTime <= currentTime && !completedProcesses.find(cp => cp.id === p.id) && p.id !== process.id)
      .map(p => p.id);

    steps.push({
      time: currentTime,
      action: `Execute ${process.id}`,
      processId: process.id,
      reason: `${process.id} selected using FCFS - it arrived first among waiting processes (Arrival Time: ${process.arrivalTime}).`,
      readyQueue: [...readyQueue],
    });

    const startTime = currentTime;
    currentTime += process.burstTime;

    ganttChart.push({
      processId: process.id,
      startTime,
      endTime: currentTime,
      color: process.color,
    });

    const completionTime = currentTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;

    completedProcesses.push({
      ...process,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    steps.push({
      time: currentTime,
      action: `${process.id} Completed`,
      processId: process.id,
      reason: `${process.id} finished execution. CT=${completionTime}, TAT=${turnaroundTime}, WT=${waitingTime}`,
      readyQueue: sortedProcesses
        .filter(p => p.arrivalTime <= currentTime && !completedProcesses.find(cp => cp.id === p.id))
        .map(p => p.id),
    });
  }

  const avgWaitingTime = completedProcesses.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / completedProcesses.length;
  const avgTurnaroundTime = completedProcesses.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / completedProcesses.length;

  return {
    ganttChart,
    processes: completedProcesses,
    avgWaitingTime,
    avgTurnaroundTime,
    steps,
  };
}
