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
      { id: 'rr', name: `RR (T=${timeQuantum})`, avgTurnaroundTime: rrResult.avgTurnaroundTime, avgWaitingTime: rrResult.avgWaitingTime },
      { id: 'sjf', name: 'SJF', avgTurnaroundTime: sjfResult.avgTurnaroundTime, avgWaitingTime: sjfResult.avgWaitingTime },
      { id: 'priority', name: 'Priority', avgTurnaroundTime: priorityResult.avgTurnaroundTime, avgWaitingTime: priorityResult.avgWaitingTime },
    ];
  }, [processes, timeQuantum]);

  if (results.length === 0) return null;

  const maxValue = Math.max(
    ...results.map(r => Math.max(r.avgTurnaroundTime, r.avgWaitingTime))
  );
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (index: number) => padding.left + (index / (results.length - 1)) * innerWidth;
  const yScale = (value: number) => padding.top + innerHeight - (value / (maxValue * 1.2)) * innerHeight;

  const tatPoints = results.map((r, i) => ({ x: xScale(i), y: yScale(r.avgTurnaroundTime), value: r.avgTurnaroundTime, algo: r.name }));
  const wtPoints = results.map((r, i) => ({ x: xScale(i), y: yScale(r.avgWaitingTime), value: r.avgWaitingTime, algo: r.name }));

  const createPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };

  const yTicks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue].map(v => Math.round(v * 100) / 100);

  return (
    <div className="glass-effect rounded-xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Algorithm Comparison
      </h3>

      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#6366f1]" />
          <div className="w-2 h-2 rounded-full border-2 border-[#6366f1] bg-transparent" />
          <span className="text-sm text-[var(--text-secondary)]">Avg Turnaround Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#ef4444]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444, #ef4444 4px, transparent 4px, transparent 8px)' }} />
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="text-sm text-[var(--text-secondary)]">Avg Waiting Time</span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yScale(tick)}
                x2={chartWidth - padding.right}
                y2={yScale(tick)}
                stroke="var(--border-color)"
                strokeDasharray="4,4"
                opacity={0.5}
              />
              <text
                x={padding.left - 10}
                y={yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-[var(--text-muted)]"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          <text
            x={10}
            y={chartHeight / 2}
            textAnchor="middle"
            className="text-xs fill-[var(--text-muted)]"
            transform={`rotate(-90, 10, ${chartHeight / 2})`}
          >
            Time (units)
          </text>

          <path
            d={createPath(tatPoints)}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            filter="url(#glow)"
          />

          <path
            d={createPath(wtPoints)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6,4"
            filter="url(#glow)"
          />

          {tatPoints.map((point, i) => (
            <g key={`tat-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.algo === results[i].name && hoveredPoint?.type === 'tat' ? 8 : 6}
                fill="var(--bg-secondary)"
                stroke="#6366f1"
                strokeWidth={2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint({ algo: results[i].name, type: 'tat' })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint?.algo === results[i].name && hoveredPoint?.type === 'tat' && (
                <g>
                  <rect
                    x={point.x - 70}
                    y={point.y - 55}
                    width={140}
                    height={45}
                    rx={6}
                    fill="var(--bg-secondary)"
                    stroke="var(--border-color)"
                  />
                  <text x={point.x - 60} y={point.y - 35} className="text-xs font-semibold fill-[var(--text-primary)]">
                    {results[i].name}
                  </text>
                  <text x={point.x - 60} y={point.y - 20} className="text-xs fill-[#6366f1]">
                    Avg TAT: {point.value.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          ))}

          {wtPoints.map((point, i) => (
            <g key={`wt-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.algo === results[i].name && hoveredPoint?.type === 'wt' ? 7 : 5}
                fill="#ef4444"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint({ algo: results[i].name, type: 'wt' })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint?.algo === results[i].name && hoveredPoint?.type === 'wt' && (
                <g>
                  <rect
                    x={point.x - 70}
                    y={point.y + 10}
                    width={140}
                    height={45}
                    rx={6}
                    fill="var(--bg-secondary)"
                    stroke="var(--border-color)"
                  />
                  <text x={point.x - 60} y={point.y + 28} className="text-xs font-semibold fill-[var(--text-primary)]">
                    {results[i].name}
                  </text>
                  <text x={point.x - 60} y={point.y + 43} className="text-xs fill-[#ef4444]">
                    Avg WT: {point.value.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          ))}

          {results.map((r, i) => (
            <text
              key={i}
              x={xScale(i)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-[var(--text-secondary)]"
            >
              {r.name}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-[var(--border-color)]">
        {results.map(r => (
          <div 
            key={r.id}
            className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center"
          >
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">{r.name}</p>
            <p className="text-xs text-[#6366f1]">TAT: {r.avgTurnaroundTime.toFixed(2)}</p>
            <p className="text-xs text-[#ef4444]">WT: {r.avgWaitingTime.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
