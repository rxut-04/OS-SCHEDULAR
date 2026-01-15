"use client";

import { useState, useCallback } from 'react';
import { Process, PROCESS_COLORS } from '@/lib/algorithms/types';

interface ProcessInput {
  id: string;
  arrivalTime: string;
  burstTime: string;
  priority: string;
}

interface ProcessInputFormProps {
  algorithm: string;
  onSubmit: (processes: Process[], timeQuantum?: number) => void;
}

export function ProcessInputForm({ algorithm, onSubmit }: ProcessInputFormProps) {
  const [processes, setProcesses] = useState<ProcessInput[]>([
    { id: 'P1', arrivalTime: '0', burstTime: '5', priority: '2' },
    { id: 'P2', arrivalTime: '1', burstTime: '3', priority: '1' },
    { id: 'P3', arrivalTime: '2', burstTime: '8', priority: '4' },
    { id: 'P4', arrivalTime: '3', burstTime: '6', priority: '3' },
  ]);
  const [timeQuantum, setTimeQuantum] = useState('2');

  const addProcess = useCallback(() => {
    const newId = `P${processes.length + 1}`;
    setProcesses(prev => [...prev, { id: newId, arrivalTime: '0', burstTime: '1', priority: '1' }]);
  }, [processes.length]);

  const removeProcess = useCallback((index: number) => {
    if (processes.length > 1) {
      setProcesses(prev => prev.filter((_, i) => i !== index));
    }
  }, [processes.length]);

  const updateProcess = useCallback((index: number, field: keyof ProcessInput, value: string) => {
    setProcesses(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  }, []);

  const handleSubmit = useCallback(() => {
    const validProcesses: Process[] = processes.map((p, index) => ({
      id: p.id || `P${index + 1}`,
      arrivalTime: parseInt(p.arrivalTime) || 0,
      burstTime: parseInt(p.burstTime) || 1,
      priority: parseInt(p.priority) || 1,
      color: PROCESS_COLORS[index % PROCESS_COLORS.length],
    }));

    const tq = algorithm === 'round-robin' ? parseInt(timeQuantum) || 2 : undefined;
    onSubmit(validProcesses, tq);
  }, [processes, algorithm, timeQuantum, onSubmit]);

  const loadSampleData = useCallback(() => {
    setProcesses([
      { id: 'P1', arrivalTime: '0', burstTime: '6', priority: '2' },
      { id: 'P2', arrivalTime: '2', burstTime: '2', priority: '1' },
      { id: 'P3', arrivalTime: '4', burstTime: '8', priority: '4' },
      { id: 'P4', arrivalTime: '6', burstTime: '3', priority: '3' },
      { id: 'P5', arrivalTime: '8', burstTime: '4', priority: '2' },
    ]);
    setTimeQuantum('3');
  }, []);

  const showPriority = algorithm === 'priority';
  const showTimeQuantum = algorithm === 'round-robin';

return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Process Input
          </h3>
          <button
            onClick={loadSampleData}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-blue-300 hover:bg-white/10 transition-all border border-white/5"
          >
            Load Sample
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2">
          {processes.map((process, index) => (
            <div 
              key={index}
              className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white/5 border border-white/5 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: PROCESS_COLORS[index % PROCESS_COLORS.length] }}
              />
              
              <input
                type="text"
                value={process.id}
                onChange={(e) => updateProcess(index, 'id', e.target.value)}
                placeholder="ID"
                className="w-12 sm:w-16 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded bg-black/20 border border-white/10 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 text-white placeholder-white/30"
              />

              <div className="flex-1 grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: showPriority ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}>
                <div>
                  <label className="text-[10px] sm:text-xs text-white/40 block mb-0.5 sm:mb-1">AT</label>
                  <input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={(e) => updateProcess(index, 'arrivalTime', e.target.value)}
                    className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 rounded bg-black/20 border border-white/10 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs text-white/40 block mb-0.5 sm:mb-1">BT</label>
                  <input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={(e) => updateProcess(index, 'burstTime', e.target.value)}
                    className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 rounded bg-black/20 border border-white/10 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 text-white"
                  />
                </div>
                {showPriority && (
                  <div>
                    <label className="text-[10px] sm:text-xs text-white/40 block mb-0.5 sm:mb-1">Pri</label>
                    <input
                      type="number"
                      min="1"
                      value={process.priority}
                      onChange={(e) => updateProcess(index, 'priority', e.target.value)}
                      className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 rounded bg-black/20 border border-white/10 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 text-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => removeProcess(index)}
                disabled={processes.length <= 1}
                className="p-1 sm:p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addProcess}
          className="w-full mt-2 sm:mt-3 py-1.5 sm:py-2 rounded-lg border border-dashed border-white/20 text-white/60 hover:border-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:bg-white/5"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Process
        </button>

        {showTimeQuantum && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-white/5 border border-white/5">
            <label className="text-xs sm:text-sm text-white/60 block mb-1.5 sm:mb-2">
              Time Quantum
            </label>
            <input
              type="number"
              min="1"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-black/20 border border-white/10 font-mono text-sm focus:outline-none focus:border-blue-400 text-white"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Visualize Algorithm
        </button>
      </div>
    );
}
