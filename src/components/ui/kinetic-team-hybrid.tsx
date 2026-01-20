'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { ArrowUpRight, Minus, Plus, Brain, Cpu } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

/* ---------- Types ---------- */

interface Module {
  id: string;
  name: string;
  category: string;
  image: string;
  href: string;
  gradient?: string;
}

/* ---------- Data ---------- */

const OS_MODULES: Module[] = [
  {
    id: '01',
    name: 'CPU Scheduling',
    category: 'Process Management',
    image: '/assets/models/scheduling-queues.png',
    href: '/cpu-scheduling',
  },
  {
    id: '02',
    name: 'Memory Management',
    category: 'Memory',
    image: '/assets/models/memory-management.png',
    href: '/memory-management',
  },
  {
    id: '03',
    name: 'Multithreading Models',
    category: 'Concurrency',
    image: '/assets/models/multithreading.png',
    href: '/multithreading',
  },
  {
    id: '04',
    name: 'Page Replacement Algorithms',
    category: 'Virtual Memory',
    image: '/assets/models/page-replacement.png',
    href: '/page-replacement',
  },
  {
    id: '05',
    name: 'File Allocation Methods',
    category: 'File Systems',
    image: '/assets/models/file-allocation.png',
    href: '/file-allocation',
  },
  {
    id: '06',
    name: 'Contiguous Memory Management',
    category: 'Memory',
    image: '/assets/models/contiguous-memory.png',
    href: '/contiguous-memory',
  },
  {
    id: '07',
    name: 'Scheduling Queues',
    category: 'Process Scheduling',
    image: '/assets/models/scheduling-queues.png',
    href: '/scheduling-queues',
  },
];

const AIML_MODULES: Module[] = [
  {
    id: 'ml-01',
    name: 'K-Means Clustering',
    category: 'Unsupervised Learning',
    image: '/assets/models/kmeans.png',
    href: '/aiml/kmeans',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'ml-02',
    name: 'Linear Regression',
    category: 'Supervised Learning',
    image: '/assets/models/linear-regression.png',
    href: '/aiml/linear-regression',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'ml-03',
    name: 'Logistic Regression',
    category: 'Classification',
    image: '/assets/models/logistic-regression.png',
    href: '/aiml/logistic-regression',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'ml-04',
    name: 'Neural Network',
    category: 'Deep Learning',
    image: '/assets/models/neural-network.png',
    href: '/aiml/neural-network',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    id: 'ml-05',
    name: 'Decision Tree',
    category: 'Classification',
    image: '/assets/models/decision-tree.png',
    href: '/aiml/decision-tree',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  {
    id: 'ml-06',
    name: 'KNN',
    category: 'Classification',
    image: '/assets/models/knn.png',
    href: '/aiml/knn',
    gradient: 'from-rose-500/20 to-red-500/20',
  },
  {
    id: 'ml-07',
    name: 'Reinforcement Learning',
    category: 'Agent-Based Learning',
    image: '/assets/models/reinforcement.png',
    href: '/aiml/reinforcement-learning',
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
];

/* ---------- Main Component ---------- */

export default function KineticModulesList() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'os' | 'aiml'>('os');
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const MODULES = activeTab === 'os' ? OS_MODULES : AIML_MODULES;

  // Mouse position resources (Global for the floating card)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics for the floating card
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Detect mobile for conditional rendering logic
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'aiml') {
      setActiveTab('aiml');
    }
  }, [searchParams]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    // Offset the cursor card so it doesn't block the text
    mouseX.set(e.clientX + 20); 
    mouseY.set(e.clientY + 20);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full cursor-default px-6 py-24 text-neutral-200 md:px-12"
    >
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      
      <div className="mx-auto max-w-6xl">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-light tracking-tighter text-white sm:text-6xl md:text-8xl">
              Learning <span className="text-neutral-600">Modules</span>
            </h1>
          </div>
          <div className="h-px flex-1 bg-neutral-900 mx-8 hidden md:block" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
            Select a topic to start
          </p>
        </motion.header>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex items-center gap-4"
        >
          <button
            onClick={() => setActiveTab('os')}
            className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 ${
              activeTab === 'os'
                ? 'bg-blue-500/10 border-blue-500/30 text-white'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'os' ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <Cpu size={24} className={activeTab === 'os' ? 'text-blue-400' : 'text-neutral-500'} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Operating Systems</div>
              <div className="text-xs text-neutral-500">CPU, Memory, Process</div>
            </div>
            {activeTab === 'os' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 border-2 border-blue-500/50 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('aiml')}
            className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 ${
              activeTab === 'aiml'
                ? 'bg-purple-500/10 border-purple-500/30 text-white'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'aiml' ? 'bg-purple-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <Brain size={24} className={activeTab === 'aiml' ? 'text-purple-400' : 'text-neutral-500'} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm flex items-center gap-2">
                AI/ML Visualizer
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 animate-pulse">NEW</span>
              </div>
              <div className="text-xs text-neutral-500">Neural Networks, Clustering</div>
            </div>
            {activeTab === 'aiml' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 border-2 border-purple-500/50 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </motion.div>

        {/* The List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {MODULES.map((module, index) => (
              <ModuleRow
                key={module.id}
                data={module}
                index={index}
                isActive={activeId === module.id}
                setActiveId={setActiveId}
                isMobile={isMobile}
                isAnyActive={activeId !== null}
                onClick={() => router.push(module.href)}
                isAIML={activeTab === 'aiml'}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DESKTOP ONLY: Global Floating Cursor Image */}
      {/* We use Portal-like fixed positioning to ensure it floats above everything smoothly */}
      {!isMobile && (
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
        >
          <AnimatePresence mode="wait">
            {activeId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative h-64 w-80 overflow-hidden rounded-xl border shadow-2xl ${
                  activeTab === 'aiml' 
                    ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-neutral-900' 
                    : 'border-white/10 bg-neutral-900'
                }`}
              >
                {/* Find the active image */}
                <Image
                  src={MODULES.find((t) => t.id === activeId)?.image || ''}
                  alt="Preview"
                  fill
                  className="h-full w-full object-cover"
                />
                
                {/* Overlay Metadata */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${activeTab === 'aiml' ? 'bg-purple-500' : 'bg-green-500'}`} />
                    <span className="text-[10px] uppercase tracking-widest text-white/80">Start Learning</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Row Component ---------- */

function ModuleRow({
  data,
  index,
  isActive,
  setActiveId,
  isMobile,
  isAnyActive,
  onClick,
  isAIML = false,
}: {
  data: Module;
  index: number;
  isActive: boolean;
  setActiveId: (id: string | null) => void;
  isMobile: boolean;
  isAnyActive: boolean;
  onClick: () => void;
  isAIML?: boolean;
}) {
  const isDimmed = isAnyActive && !isActive;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDimmed ? 0.3 : 1, 
        y: 0,
        backgroundColor: isActive && isMobile ? 'rgba(255,255,255,0.03)' : 'transparent'
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => !isMobile && setActiveId(data.id)}
      onMouseLeave={() => !isMobile && setActiveId(null)}
      onClick={onClick}
      className={`group relative border-t border-neutral-900 transition-colors duration-500 last:border-b cursor-pointer ${
        isAIML && isActive ? 'bg-gradient-to-r from-purple-500/5 to-transparent' : ''
      }`}
    >
      <div className="relative z-10 flex flex-col py-8 md:flex-row md:items-center md:justify-between md:py-12">
        
        {/* Name & Index Section */}
        <div className="flex items-baseline gap-6 md:gap-12 pl-4 md:pl-0 transition-transform duration-500 group-hover:translate-x-4">
          <span className={`font-mono text-xs ${isAIML ? 'text-purple-500/50' : 'text-neutral-600'}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className={`text-3xl font-medium tracking-tight transition-colors duration-300 md:text-6xl ${
            isAIML 
              ? 'text-neutral-400 group-hover:text-purple-300' 
              : 'text-neutral-400 group-hover:text-white'
          }`}>
            {data.name}
          </h2>
        </div>

        {/* Role & Icon Section */}
        <div className="mt-4 flex items-center justify-between pl-12 pr-4 md:mt-0 md:justify-end md:gap-12 md:pl-0 md:pr-0">
          <span className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
            isAIML 
              ? 'text-purple-500/40 group-hover:text-purple-400' 
              : 'text-neutral-600 group-hover:text-neutral-400'
          }`}>
            {data.category}
          </span>
          
          {/* Mobile Toggle Icon */}
          <div className={`block md:hidden ${isAIML ? 'text-purple-400' : 'text-neutral-500'}`}>
            <ArrowUpRight size={18} />
          </div>

          {/* Desktop Arrow */}
          <motion.div
             animate={{ x: isActive ? 0 : -10, opacity: isActive ? 1 : 0 }}
             className={`hidden md:block ${isAIML ? 'text-purple-400' : 'text-white'}`}
          >
             <ArrowUpRight size={28} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
