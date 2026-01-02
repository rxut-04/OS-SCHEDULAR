"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    setHasScrolled(true);
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen grid-pattern">
<header className="glass-effect sticky top-0 z-50 md:block hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">AlgoViz OS</h1>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">OS Algorithm Visualizer</p>
              </div>
            </div>

          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <section className="md:hidden min-h-screen flex flex-col items-center justify-center px-4 relative">
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3 text-center">
          Operating System
          <span className="block text-[var(--accent-primary)]">Algorithm Visualizer</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto text-center mb-8">
          Learn OS concepts visually through interactive animations
        </p>
        
        <button
          onClick={handleScrollDown}
          className={`flex flex-col items-center gap-2 text-[var(--accent-primary)] transition-all duration-500 ${hasScrolled ? 'opacity-0' : 'opacity-100 animate-bounce'}`}
        >
          <span className="text-xs text-[var(--text-secondary)]">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      <div 
        ref={contentRef}
        className={`md:block transition-all duration-700 ${hasScrolled ? 'opacity-100 translate-y-0' : 'md:opacity-100 md:translate-y-0 opacity-0 translate-y-10'}`}
      >

<main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
          <div className="text-center mb-8 sm:mb-16 animate-fade-in hidden md:block">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              Operating System
              <span className="block text-[var(--accent-primary)]">Algorithm Visualizer</span>
            </h2>
            <p className="text-sm sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto px-2">
              Learn Operating System concepts visually through interactive animations. 
              Understand how CPU scheduling, disk management, and memory allocation work step-by-step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-16">
          {CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
{category.available ? (
                  <Link
                    href={category.href}
                    className="group block glass-effect rounded-2xl p-4 sm:p-6 h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    style={{ 
                      borderColor: `${category.color}30`,
                      '--hover-glow': category.color 
                    } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div 
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8">{category.icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-semibold text-[var(--text-primary)] mb-1 sm:mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {category.algorithms.map(algo => (
                            <span 
                              key={algo}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono"
                              style={{ backgroundColor: `${category.color}15`, color: category.color }}
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm font-medium" style={{ color: category.color }}>
                      Start Learning
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="glass-effect rounded-2xl p-4 sm:p-6 h-full opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div 
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category.color}10`, color: `${category.color}80` }}
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8">{category.icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                          <h3 className="text-base sm:text-xl font-semibold text-[var(--text-primary)]">
                            {category.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {category.algorithms.map(algo => (
                            <span 
                              key={algo}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>

<div className="glass-effect rounded-2xl p-4 sm:p-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-4 sm:mb-6 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-[var(--accent-primary)]">1</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Select Algorithm</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Choose from various OS algorithms like FCFS, SJF, Round Robin, and more
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent-secondary)]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-[var(--accent-secondary)]">2</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Enter Input</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Input your custom process data including arrival time, burst time, and priority
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent-tertiary)]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-[var(--accent-tertiary)]">3</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Watch & Learn</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  View animated Gantt charts and step-by-step explanations of algorithm decisions
                </p>
              </div>
            </div>
            </div>
        </main>

        <footer className="mt-8 sm:mt-16 py-6 sm:py-8 border-t border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-[var(--text-muted)] text-xs sm:text-sm">
            <p>AlgoViz OS - Learn Operating System Algorithms Visually</p>
            <p className="mt-2">Built for students and educators</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
