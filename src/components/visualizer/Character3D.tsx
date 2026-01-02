"use client";

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface CharacterProps {
  position: [number, number, number];
  targetPosition?: [number, number, number];
  animation: 'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk';
  lookAt?: THREE.Vector3;
  holdingBlock?: { color: string; width: number } | null;
}

function CharacterBody({ animation, holdingBlock }: { animation: string; holdingBlock?: { color: string; width: number } | null }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * 2) * 0.05;
    }
    
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
    }
    
    if (eyesRef.current) {
      const blinkCycle = time % 4;
      eyesRef.current.scale.y = blinkCycle < 0.1 ? 0.1 : 1;
    }
    
    if (leftArmRef.current && rightArmRef.current) {
      switch (animation) {
        case 'idle':
          leftArmRef.current.rotation.x = Math.sin(time * 1.5) * 0.1;
          rightArmRef.current.rotation.x = Math.sin(time * 1.5 + Math.PI) * 0.1;
          leftArmRef.current.rotation.z = 0.2;
          rightArmRef.current.rotation.z = -0.2;
          break;
        case 'wave':
          rightArmRef.current.rotation.z = -Math.PI / 2 - 0.5;
          rightArmRef.current.rotation.x = Math.sin(time * 8) * 0.4;
          leftArmRef.current.rotation.x = 0;
          leftArmRef.current.rotation.z = 0.2;
          break;
        case 'point':
          rightArmRef.current.rotation.z = -Math.PI / 3;
          rightArmRef.current.rotation.x = -0.3;
          leftArmRef.current.rotation.x = 0;
          leftArmRef.current.rotation.z = 0.2;
          break;
        case 'pickup':
        case 'place':
          const pickupProgress = (Math.sin(time * 3) + 1) / 2;
          rightArmRef.current.rotation.x = -pickupProgress * 1.2;
          rightArmRef.current.rotation.z = -0.3;
          leftArmRef.current.rotation.x = -pickupProgress * 1.2;
          leftArmRef.current.rotation.z = 0.3;
          break;
        case 'explain':
          leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.3 - 0.5;
          leftArmRef.current.rotation.z = 0.5 + Math.sin(time * 2.5) * 0.2;
          rightArmRef.current.rotation.x = Math.sin(time * 2 + 1) * 0.3 - 0.5;
          rightArmRef.current.rotation.z = -0.5 - Math.sin(time * 2.5 + 1) * 0.2;
          break;
        case 'walk':
          leftArmRef.current.rotation.x = Math.sin(time * 6) * 0.5;
          rightArmRef.current.rotation.x = Math.sin(time * 6 + Math.PI) * 0.5;
          leftArmRef.current.rotation.z = 0.1;
          rightArmRef.current.rotation.z = -0.1;
          break;
      }
    }
    
    if (leftLegRef.current && rightLegRef.current) {
      if (animation === 'walk') {
        leftLegRef.current.rotation.x = Math.sin(time * 6) * 0.4;
        rightLegRef.current.rotation.x = Math.sin(time * 6 + Math.PI) * 0.4;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
  });

  const skinColor = '#FFB6C1';
  const hairColor = '#4A3728';
  const shirtColor = '#FF6B9D';
  const pantsColor = '#2D3748';
  const eyeColor = '#3B82F6';
  
  return (
    <group ref={bodyRef}>
      <group ref={headRef} position={[0, 1.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        
        <mesh position={[0, 0.2, 0]} scale={[1.1, 0.7, 1.05]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        
        <mesh position={[-0.15, 0.35, 0.2]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.15, 0.3, 0.05]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.15, 0.35, 0.2]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.15, 0.3, 0.05]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        
        <group ref={eyesRef}>
          <mesh position={[-0.1, 0.05, 0.3]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.35]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          
          <mesh position={[0.1, 0.05, 0.3]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.1, 0.05, 0.35]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
        </group>
        
        <mesh position={[0, -0.05, 0.32]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#E8A090" />
        </mesh>
        
        <mesh position={[0, -0.15, 0.3]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.02]} />
          <meshStandardMaterial color="#FF9999" />
        </mesh>
      </group>
      
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.25, 0.5, 16, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.35, 1.1, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.35, 1.1, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        
        {holdingBlock && (
          <mesh position={[0, -0.7, 0.2]}>
            <boxGeometry args={[holdingBlock.width * 0.3, 0.3, 0.4]} />
            <meshStandardMaterial 
              color={holdingBlock.color} 
              emissive={holdingBlock.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>
      
      <group ref={leftLegRef} position={[-0.12, 0.35, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.25, 8, 8]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.12, 0.35, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.25, 8, 8]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
    </group>
  );
}

export function Character3D({ position, animation, holdingBlock }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={position} scale={[1.2, 1.2, 1.2]}>
      <CharacterBody animation={animation} holdingBlock={holdingBlock} />
      <pointLight position={[0, 2, 1]} intensity={0.5} color="#FFE4E1" distance={5} />
    </group>
  );
}

interface SpeechBubbleProps {
  text: string;
  position: [number, number, number];
  visible: boolean;
}

export function SpeechBubble({ text, position, visible }: SpeechBubbleProps) {
  if (!visible || !text) return null;
  
  return (
    <Html position={position} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
      <div className="relative animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-pink-200 max-w-[280px]">
          <p className="text-gray-800 text-sm font-medium leading-relaxed">{text}</p>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-pink-200" />
      </div>
    </Html>
  );
}

export interface AlgorithmStep {
  type: 'intro' | 'explain' | 'pickup' | 'place' | 'highlight' | 'complete';
  message: string;
  blockIndex?: number;
  processId?: string;
  targetPosition?: [number, number, number];
  duration: number;
}

export function generateAlgorithmSteps(
  ganttChart: GanttBlock[],
  processes: Process[],
  algorithm: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  steps.push({
    type: 'intro',
    message: `Hi! I'm here to explain how ${algorithm} scheduling works! Let me show you step by step.`,
    duration: 4000
  });
  
  const algorithmExplanations: Record<string, string> = {
    'FCFS': 'First Come First Serve executes processes in the order they arrive. Simple and fair, but can cause long waiting times!',
    'SJF': 'Shortest Job First picks the process with the smallest burst time. This minimizes average waiting time!',
    'SRTF': 'Shortest Remaining Time First is preemptive SJF. If a shorter job arrives, we switch to it immediately!',
    'Priority': 'Priority Scheduling runs higher priority processes first. Be careful of starvation for low priority tasks!',
    'Round Robin': 'Round Robin gives each process a time quantum. Fair for all processes with good response time!',
    'default': 'This scheduling algorithm determines which process runs on the CPU and when.'
  };
  
  steps.push({
    type: 'explain',
    message: algorithmExplanations[algorithm] || algorithmExplanations['default'],
    duration: 5000
  });
  
  steps.push({
    type: 'explain',
    message: 'Now watch as I arrange the process blocks on the timeline based on this algorithm!',
    duration: 3000
  });
  
  ganttChart.forEach((block, index) => {
    const process = processes.find(p => p.id === block.processId);
    if (!process) return;
    
    steps.push({
      type: 'pickup',
      message: `Picking up ${block.processId}... This process needs ${block.endTime - block.startTime} time units.`,
      blockIndex: index,
      processId: block.processId,
      duration: 2500
    });
    
    steps.push({
      type: 'place',
      message: `Placing ${block.processId} at time ${block.startTime} to ${block.endTime} on the timeline.`,
      blockIndex: index,
      processId: block.processId,
      duration: 2500
    });
  });
  
  const avgWaiting = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / processes.length;
  const avgTurnaround = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / processes.length;
  
  steps.push({
    type: 'complete',
    message: `Done! Average waiting time: ${avgWaiting.toFixed(1)}, Average turnaround: ${avgTurnaround.toFixed(1)}. Great job understanding ${algorithm}!`,
    duration: 5000
  });
  
  return steps;
}

interface AnimatedCharacterSceneProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  algorithm: string;
  isPlaying: boolean;
  onStepChange?: (stepIndex: number, step: AlgorithmStep) => void;
  totalTime: number;
}

export function AnimatedCharacterScene({
  ganttChart,
  processes,
  algorithm,
  isPlaying,
  onStepChange,
  totalTime
}: AnimatedCharacterSceneProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [characterPosition, setCharacterPosition] = useState<[number, number, number]>([-12, 0, 0]);
  const [characterAnimation, setCharacterAnimation] = useState<'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk'>('wave');
  const [speechText, setSpeechText] = useState('');
  const [holdingBlock, setHoldingBlock] = useState<{ color: string; width: number } | null>(null);
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());
  
  const steps = useMemo(() => 
    generateAlgorithmSteps(ganttChart, processes, algorithm),
    [ganttChart, processes, algorithm]
  );
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const step = steps[currentStepIndex];
    if (!step) return;
    
    setSpeechText(step.message);
    onStepChange?.(currentStepIndex, step);
    
    switch (step.type) {
      case 'intro':
        setCharacterAnimation('wave');
        setCharacterPosition([-12, 0, (processes.length - 1) * 1.25]);
        break;
      case 'explain':
        setCharacterAnimation('explain');
        break;
      case 'pickup':
        setCharacterAnimation('pickup');
        if (step.blockIndex !== undefined) {
          const block = ganttChart[step.blockIndex];
          const process = processes.find(p => p.id === block.processId);
          const rowIndex = processes.findIndex(p => p.id === block.processId);
          if (process) {
            const width = ((block.endTime - block.startTime) / totalTime) * 16;
            setHoldingBlock({ color: process.color, width });
            setCharacterPosition([-12, 0, rowIndex * 2.5]);
          }
        }
        break;
      case 'place':
        setCharacterAnimation('place');
        if (step.blockIndex !== undefined) {
          const block = ganttChart[step.blockIndex];
          const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
          const rowIndex = processes.findIndex(p => p.id === block.processId);
          setCharacterPosition([xPos - 2, 0, rowIndex * 2.5 + 2]);
          
          setTimeout(() => {
            setHoldingBlock(null);
            setVisibleBlocks(prev => new Set([...prev, step.blockIndex!]));
          }, step.duration * 0.6);
        }
        break;
      case 'complete':
        setCharacterAnimation('wave');
        setCharacterPosition([-12, 0, (processes.length - 1) * 1.25]);
        setHoldingBlock(null);
        break;
    }
    
    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }, step.duration);
    
    return () => clearTimeout(timer);
  }, [currentStepIndex, isPlaying, steps, ganttChart, processes, totalTime, onStepChange]);
  
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStepIndex(0);
      setVisibleBlocks(new Set());
      setHoldingBlock(null);
      setSpeechText('');
      setCharacterAnimation('idle');
    }
  }, [isPlaying]);
  
  return (
    <>
      <Character3D
        position={characterPosition}
        animation={characterAnimation}
        holdingBlock={holdingBlock}
      />
      <SpeechBubble
        text={speechText}
        position={[characterPosition[0], characterPosition[1] + 3, characterPosition[2]]}
        visible={!!speechText}
      />
    </>
  );
}
