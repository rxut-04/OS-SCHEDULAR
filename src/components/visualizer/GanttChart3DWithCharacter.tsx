"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';
import { Character3D, SpeechBubble, generateAlgorithmSteps, AlgorithmStep } from './Character3D';

interface AnimatedBlockProps {
  block: GanttBlock;
  process: Process;
  totalTime: number;
  rowIndex: number;
  isVisible: boolean;
  isBeingPlaced: boolean;
}

function AnimatedBlock({ block, process, totalTime, rowIndex, isVisible, isBeingPlaced }: AnimatedBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const width = Math.max(((block.endTime - block.startTime) / totalTime) * 16, 0.5);
  const finalXPos = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
  const zPos = rowIndex * 2.5;
  
  useEffect(() => {
    if (isBeingPlaced) {
      setAnimationProgress(0);
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 800, 1);
        setAnimationProgress(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isBeingPlaced]);
  
  useFrame((state) => {
    if (meshRef.current && isVisible) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  if (!isVisible && !isBeingPlaced) return null;
  
  const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  
  const currentY = isBeingPlaced ? 5 - easeOutBack(animationProgress) * 4.25 : 0.75;
  const currentScale = isBeingPlaced ? 0.5 + easeOutBack(animationProgress) * 0.5 : 1;
  const currentOpacity = isBeingPlaced ? animationProgress : 1;

  return (
    <group position={[finalXPos, currentY, zPos]} scale={[currentScale, currentScale, currentScale]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, 1.2, 1.5]} />
        <meshStandardMaterial
          color={process.color}
          transparent
          opacity={currentOpacity}
          metalness={0.3}
          roughness={0.4}
          emissive={process.color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {isVisible && (
        <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
          <div className="text-center">
            <span className="text-white text-lg font-bold drop-shadow-lg">
              {block.endTime - block.startTime}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ProcessLabel({ process, rowIndex }: { process: Process; rowIndex: number }) {
  return (
    <group position={[-10, 0.75, rowIndex * 2.5]}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={process.color} emissive={process.color} emissiveIntensity={0.4} />
      </mesh>
      <Html position={[0.8, 0, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
        <span className="text-base font-bold whitespace-nowrap" style={{ color: process.color }}>
          {process.id}
        </span>
      </Html>
    </group>
  );
}

function CameraController({ processCount }: { processCount: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    const zCenter = (processCount - 1) * 1.25;
    camera.position.set(2, 8, zCenter + 18);
    camera.lookAt(0, 0, zCenter);
  }, [camera, processCount]);
  
  return null;
}

interface CharacterControllerProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  algorithm: string;
  isExplaining: boolean;
  totalTime: number;
  onBlockPlace: (blockIndex: number) => void;
  onComplete: () => void;
}

function CharacterController({
  ganttChart,
  processes,
  algorithm,
  isExplaining,
  totalTime,
  onBlockPlace,
  onComplete
}: CharacterControllerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [characterPosition, setCharacterPosition] = useState<[number, number, number]>([-13, 0, 0]);
  const [characterAnimation, setCharacterAnimation] = useState<'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk'>('idle');
  const [speechText, setSpeechText] = useState('');
  const [holdingBlock, setHoldingBlock] = useState<{ color: string; width: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const placeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const steps = useMemo(() => 
    generateAlgorithmSteps(ganttChart, processes, algorithm),
    [ganttChart, processes, algorithm]
  );

  const processStep = useCallback((stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;
    
    setSpeechText(step.message);
    
    switch (step.type) {
      case 'intro':
        setCharacterAnimation('wave');
        setCharacterPosition([-13, 0, (processes.length - 1) * 1.25]);
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
            setCharacterPosition([-13, 0, rowIndex * 2.5]);
          }
        }
        break;
      case 'place':
        setCharacterAnimation('place');
        if (step.blockIndex !== undefined) {
          const block = ganttChart[step.blockIndex];
          const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
          const rowIndex = processes.findIndex(p => p.id === block.processId);
          setCharacterPosition([xPos - 2.5, 0, rowIndex * 2.5 + 3]);
          
          placeTimerRef.current = setTimeout(() => {
            setHoldingBlock(null);
            onBlockPlace(step.blockIndex!);
          }, step.duration * 0.5);
        }
        break;
      case 'complete':
        setCharacterAnimation('wave');
        setCharacterPosition([-13, 0, (processes.length - 1) * 1.25]);
        setHoldingBlock(null);
        placeTimerRef.current = setTimeout(() => onComplete(), step.duration);
        break;
    }
  }, [steps, ganttChart, processes, totalTime, onBlockPlace, onComplete]);
  
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (placeTimerRef.current) {
      clearTimeout(placeTimerRef.current);
      placeTimerRef.current = null;
    }
    
    if (!isExplaining) {
      setCurrentStepIndex(0);
      setHoldingBlock(null);
      setSpeechText('');
      setCharacterAnimation('idle');
      setCharacterPosition([-13, 0, (processes.length - 1) * 1.25]);
      return;
    }
    
    processStep(currentStepIndex);
    
    const step = steps[currentStepIndex];
    if (step && currentStepIndex < steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, step.duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (placeTimerRef.current) {
        clearTimeout(placeTimerRef.current);
      }
    };
  }, [currentStepIndex, isExplaining, steps.length, processStep, processes.length]);
  
  return (
    <>
      <Character3D
        position={characterPosition}
        animation={characterAnimation}
        holdingBlock={holdingBlock}
      />
      <SpeechBubble
        text={speechText}
        position={[characterPosition[0] + 0.5, characterPosition[1] + 3.8, characterPosition[2]]}
        visible={!!speechText && isExplaining}
      />
    </>
  );
}

interface SceneWithCharacterProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  algorithm: string;
  isExplaining: boolean;
  showAllBlocks: boolean;
}

function SceneWithCharacter({
  ganttChart,
  processes,
  algorithm,
  isExplaining,
  showAllBlocks
}: SceneWithCharacterProps) {
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());
  const [placingBlock, setPlacingBlock] = useState<number | null>(null);
  
  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 1;
  const zCenter = (processes.length - 1) * 1.25;
  
  useEffect(() => {
    if (!isExplaining) {
      if (showAllBlocks) {
        setVisibleBlocks(new Set(ganttChart.map((_, i) => i)));
      } else {
        setVisibleBlocks(new Set());
      }
      setPlacingBlock(null);
    }
  }, [isExplaining, showAllBlocks, ganttChart]);
  
  const handleBlockPlace = useCallback((blockIndex: number) => {
    setPlacingBlock(blockIndex);
    setTimeout(() => {
      setVisibleBlocks(prev => new Set([...prev, blockIndex]));
      setPlacingBlock(null);
    }, 800);
  }, []);
  
  const handleComplete = useCallback(() => {
  }, []);
  
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = totalTime > 20 ? Math.ceil(totalTime / 10) : totalTime > 10 ? 2 : 1;
    for (let i = 0; i <= totalTime; i += step) {
      markers.push(i);
    }
    return markers;
  }, [totalTime]);

  return (
    <>
      <CameraController processCount={processes.length} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 20, 15]} intensity={1.2} />
      <pointLight position={[-10, 15, -10]} intensity={0.6} color="#22d3ee" />
      <spotLight position={[0, 25, zCenter]} angle={0.4} penumbra={1} intensity={0.8} />
      <pointLight position={[-15, 5, zCenter]} intensity={0.4} color="#FFB6C1" />
      
      <Stars radius={150} depth={60} count={3000} factor={5} saturation={0} fade speed={0.5} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zCenter]}>
        <planeGeometry args={[28, processes.length * 2.5 + 6]} />
        <meshStandardMaterial color="#0a0a18" opacity={0.98} transparent />
      </mesh>
      
      <gridHelper args={[28, 28, '#1a1a30', '#151525']} position={[0, 0.01, zCenter]} />
      
      {processes.map((process, index) => (
        <ProcessLabel key={process.id} process={process} rowIndex={index} />
      ))}
      
      {ganttChart.map((block, index) => {
        const process = processes.find(p => p.id === block.processId);
        const rowIndex = processes.findIndex(p => p.id === block.processId);
        if (!process) return null;
        
        const isVisible = visibleBlocks.has(index) || showAllBlocks;
        const isBeingPlaced = placingBlock === index;
        
        return (
          <AnimatedBlock
            key={index}
            block={block}
            process={process}
            totalTime={totalTime}
            rowIndex={rowIndex}
            isVisible={isVisible}
            isBeingPlaced={isBeingPlaced}
          />
        );
      })}
      
      {timeMarkers.map(time => {
        const xPos = (time / totalTime) * 16 - 8;
        return (
          <group key={time} position={[xPos, 0.02, -1.8]}>
            <mesh>
              <boxGeometry args={[0.06, 0.06, 0.5]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
            <Html position={[0, -0.4, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {time}
              </span>
            </Html>
          </group>
        );
      })}
      
      <CharacterController
        ganttChart={ganttChart}
        processes={processes}
        algorithm={algorithm}
        isExplaining={isExplaining}
        totalTime={totalTime}
        onBlockPlace={handleBlockPlace}
        onComplete={handleComplete}
      />
      
      <OrbitControls
        target={[0, 0, zCenter]}
        enablePan={true}
        minDistance={8}
        maxDistance={45}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

interface GanttChart3DWithCharacterProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  algorithm: string;
  isExplaining: boolean;
  showAllBlocks?: boolean;
}

export function GanttChart3DWithCharacter({
  ganttChart,
  processes,
  algorithm,
  isExplaining,
  showAllBlocks = false
}: GanttChart3DWithCharacterProps) {
  if (!ganttChart.length || !processes.length) {
    return (
      <div className="w-full h-full bg-[#0a0a15] flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '100vh' }}>
      <Canvas
        camera={{ 
          fov: 50,
          near: 0.1,
          far: 300
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneWithCharacter
          ganttChart={ganttChart}
          processes={processes}
          algorithm={algorithm}
          isExplaining={isExplaining}
          showAllBlocks={showAllBlocks}
        />
      </Canvas>
    </div>
  );
}
