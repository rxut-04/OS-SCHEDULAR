import { Process, GanttBlock, SchedulingResult, ExecutionStep } from './types';

export function sjf(processes: Process[]): SchedulingResult {
  const ganttChart: GanttBlock[] = [];
  const steps: ExecutionStep[] = [];
  const remainingProcesses = [...processes].map(p => ({ ...p }));
  const completedProcesses: Process[] = [];
  let currentTime = 0;

  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);

    if (availableProcesses.length === 0) {
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      steps.push({
        time: currentTime,
        action: 'CPU Idle',
        processId: null,
        reason: `No process in ready queue. CPU idle until time ${nextArrival}.`,
        readyQueue: [],
      });
      currentTime = nextArrival;
      continue;
    }

    availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
    const selectedProcess = availableProcesses[0];

    const readyQueue = availableProcesses.map(p => p.id);

    steps.push({
      time: currentTime,
      action: `Execute ${selectedProcess.id}`,
      processId: selectedProcess.id,
      reason: `${selectedProcess.id} selected - has shortest burst time (${selectedProcess.burstTime}) among ready processes: ${readyQueue.join(', ')}.`,
      readyQueue: readyQueue.filter(id => id !== selectedProcess.id),
    });

    const startTime = currentTime;
    currentTime += selectedProcess.burstTime;

    ganttChart.push({
      processId: selectedProcess.id,
      startTime,
      endTime: currentTime,
      color: selectedProcess.color,
    });

    const completionTime = currentTime;
    const turnaroundTime = completionTime - selectedProcess.arrivalTime;
    const waitingTime = turnaroundTime - selectedProcess.burstTime;

    completedProcesses.push({
      ...selectedProcess,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    steps.push({
      time: currentTime,
      action: `${selectedProcess.id} Completed`,
      processId: selectedProcess.id,
      reason: `${selectedProcess.id} finished. Completion Time=${completionTime}, Turnaround Time=${turnaroundTime}, Waiting Time=${waitingTime}`,
      readyQueue: remainingProcesses
        .filter(p => p.arrivalTime <= currentTime && p.id !== selectedProcess.id)
        .map(p => p.id),
    });

    const index = remainingProcesses.findIndex(p => p.id === selectedProcess.id);
    remainingProcesses.splice(index, 1);
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
