"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header as HeroHeader, HeroContent, PulsingCircle } from '@/components/ui/shaders-hero-section';

const CATEGORIES = [
  {
    id: 'cpu-scheduling',
    title: 'CPU Scheduling',
    description: 'Visualize how the CPU allocates time to processes using various scheduling algorithms',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    algorithms: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
    href: '/cpu-scheduling',
    color: '#00d9ff',
    available: true,
  },
  {
    id: 'disk-scheduling',
    title: 'Disk Scheduling',
    description: 'Learn how disk head movement is optimized using different scheduling techniques',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    algorithms: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'],
    href: '/disk-scheduling',
    color: '#7c3aed',
    available: false,
  },
  {
    id: 'memory-management',
    title: 'Memory Management',
    description: 'Understand memory allocation strategies and how OS manages system memory',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    algorithms: ['First Fit', 'Best Fit', 'Worst Fit', 'Next Fit'],
    href: '/memory-management',
    color: '#10b981',
    available: true,
  },
  {
    id: 'page-replacement',
    title: 'Page Replacement',
    description: 'Explore page replacement algorithms used in virtual memory systems',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    algorithms: ['FIFO', 'LRU', 'Optimal', 'Clock'],
    href: '/page-replacement',
    color: '#f59e0b',
    available: false,
  },
];

export default function HomePage() {
  const [theme] = useState<'dark' | 'light'>('dark');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen relative">
      
      <div className="relative z-10">
        <div className="min-h-screen relative flex flex-col">
            <HeroHeader />
            <div className="flex-1 relative">
                <HeroContent />
                <PulsingCircle />
            </div>
        </div>
      </div>
    </div>
  );
}
