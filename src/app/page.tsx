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
    available: false,
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

        <div 
          ref={contentRef}
          className="relative bg-transparent backdrop-blur-md border-t border-white/10"
        >
          <main className="max-w-7xl mx-auto px-6 py-24">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
              {CATEGORIES.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {category.available ? (
                    <Link
                      href={category.href}
                      className="group block relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-white"
                                >
                                    <div className="w-6 h-6">{category.icon}</div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                    Start Learning
                                </span>
                            </div>
                            
                            <h3 className="text-2xl font-medium text-white mb-3 group-hover:text-blue-300 transition-colors">
                            {category.title}
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                            {category.description}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {category.algorithms.map(algo => (
                            <span 
                              key={algo}
                              className="px-2 py-1 rounded-md text-xs font-mono bg-white/5 text-white/50 border border-white/5"
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="group block relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 opacity-60">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-white/50"
                                    >
                                        <div className="w-6 h-6">{category.icon}</div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/40 border border-white/10">
                                        Coming Soon
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-medium text-white/80 mb-3">
                                {category.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed mb-6">
                                {category.description}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                            {category.algorithms.map(algo => (
                                <span 
                                key={algo}
                                className="px-2 py-1 rounded-md text-xs font-mono bg-white/5 text-white/30 border border-white/5"
                                >
                                {algo}
                                </span>
                            ))}
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fade-in">
              <h3 className="text-2xl md:text-3xl font-light text-white mb-12">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Lines (Desktop only) */}
                <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 relative z-10 backdrop-blur-xl">
                    <span className="text-xl font-medium text-white">1</span>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Select Algorithm</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Choose from various OS algorithms like FCFS, SJF, Round Robin, and more
                  </p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 relative z-10 backdrop-blur-xl">
                    <span className="text-xl font-medium text-white">2</span>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Enter Input</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Input your custom process data including arrival time, burst time, and priority
                  </p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 relative z-10 backdrop-blur-xl">
                    <span className="text-xl font-medium text-white">3</span>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Watch & Learn</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    View animated Gantt charts and step-by-step explanations of algorithm decisions
                  </p>
                </div>
              </div>
            </div>
          </main>

          <footer className="border-t border-white/10 bg-black/20">
            <div className="max-w-7xl mx-auto px-6 py-12 text-center">
              <p className="text-white font-medium mb-2">AlgoViz OS - Learn Operating System Algorithms Visually</p>
              <p className="text-white/40 text-sm">Built for students and educators</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
