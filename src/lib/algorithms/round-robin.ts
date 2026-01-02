import { Process, GanttBlock, SchedulingResult, ExecutionStep } from './types';

export function roundRobin(processes: Process[], timeQuantum: number): SchedulingResult {
  const ganttChart: GanttBlock[] = [];
  const steps: ExecutionStep[] = [];
  const queue: Process[] = [];
  const remainingProcesses = [...processes].map(p => ({ ...p, remainingTime: p.burstTime }));
  const completedProcesses: Process[] = [];
  let currentTime = 0;

  remainingProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const addArrivedProcesses = (time: number, excludeId?: string) => {
    const newArrivals = remainingProcesses.filter(
      p => p.arrivalTime <= time && !queue.includes(p) && p.remainingTime! > 0 && p.id !== excludeId
    );
    queue.push(...newArrivals);
  };

  addArrivedProcesses(currentTime);

  while (queue.length > 0 || remainingProcesses.some(p => p.remainingTime! > 0)) {
    if (queue.length === 0) {
      const nextArrival = remainingProcesses
        .filter(p => p.remainingTime! > 0)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      
      if (nextArrival) {
        steps.push({
          time: currentTime,
          action: 'CPU Idle',
          processId: null,
          reason: `No process in ready queue. Waiting for ${nextArrival.id} at time ${nextArrival.arrivalTime}.`,
          readyQueue: [],
        });
        currentTime = nextArrival.arrivalTime;
        addArrivedProcesses(currentTime);
      }
      continue;
    }

    const currentProcess = queue.shift()!;
    const executeTime = Math.min(timeQuantum, currentProcess.remainingTime!);
    const startTime = currentTime;

    steps.push({
      time: currentTime,
      action: `Execute ${currentProcess.id}`,
      processId: currentProcess.id,
      reason: `${currentProcess.id} gets CPU for ${executeTime} units (Time Quantum: ${timeQuantum}, Remaining: ${currentProcess.remainingTime}).`,
      readyQueue: queue.map(p => p.id),
    });

    currentTime += executeTime;
    currentProcess.remainingTime! -= executeTime;

    ganttChart.push({
      processId: currentProcess.id,
      startTime,
      endTime: currentTime,
      color: currentProcess.color,
    });

    addArrivedProcesses(currentTime, currentProcess.id);

    if (currentProcess.remainingTime! > 0) {
      queue.push(currentProcess);
      steps.push({
        time: currentTime,
        action: `${currentProcess.id} Preempted`,
        processId: currentProcess.id,
        reason: `Time quantum expired. ${currentProcess.id} moved to end of queue. Remaining burst: ${currentProcess.remainingTime}`,
        readyQueue: queue.map(p => p.id),
      });
    } else {
      const completionTime = currentTime;
      const turnaroundTime = completionTime - currentProcess.arrivalTime;
      const waitingTime = turnaroundTime - currentProcess.burstTime;

      completedProcesses.push({
        ...currentProcess,
        completionTime,
        turnaroundTime,
        waitingTime,
      });

      const index = remainingProcesses.findIndex(p => p.id === currentProcess.id);
      remainingProcesses[index] = { ...remainingProcesses[index], remainingTime: 0 };

      steps.push({
        time: currentTime,
        action: `${currentProcess.id} Completed`,
        processId: currentProcess.id,
        reason: `${currentProcess.id} finished execution. CT=${completionTime}, TAT=${turnaroundTime}, WT=${waitingTime}`,
        readyQueue: queue.map(p => p.id),
      });
    }
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
