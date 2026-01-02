"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';
import { Character3D, SpeechBubble, generateAlgorithmSteps } from './Character3D';

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
        const progress = Math.min(elapsed / 600, 1);
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
  
  const easeOutBounce = (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  };
  
  const currentY = isBeingPlaced ? 4 - easeOutBounce(animationProgress) * 3.25 : 0.75;
  const currentScale = isBeingPlaced ? 0.6 + easeOutBounce(animationProgress) * 0.4 : 1;
  const currentOpacity = isBeingPlaced ? 0.3 + animationProgress * 0.7 : 1;

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
          emissiveIntensity={isBeingPlaced ? 0.5 : 0.2}
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

function AxisSystem({ totalTime, processCount }: { totalTime: number; processCount: number }) {
  const yAxisLength = processCount * 2.5 + 2;
  
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = totalTime > 20 ? Math.ceil(totalTime / 10) : totalTime > 10 ? 2 : 1;
    for (let i = 0; i <= totalTime; i += step) {
      markers.push(i);
    }
    return markers;
  }, [totalTime]);
  
  return (
    <group>
      <Line
        points={[[-8, 0.05, -1.5], [10, 0.05, -1.5]]}
        color="#00ffff"
        lineWidth={3}
      />
      <mesh position={[10.3, 0.05, -1.5]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <Html position={[11.5, 0.3, -1.5]} center style={{ pointerEvents: 'none' }}>
        <span className="text-cyan-400 font-bold text-lg">Time (X)</span>
      </Html>
      
      <Line
        points={[[-8.5, 0.05, -1.5], [-8.5, 0.05, yAxisLength - 1]]}
        color="#ff69b4"
        lineWidth={3}
      />
      <mesh position={[-8.5, 0.05, yAxisLength - 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#ff69b4" />
      </mesh>
      <Html position={[-8.5, 0.8, yAxisLength]} center style={{ pointerEvents: 'none' }}>
        <span className="text-pink-400 font-bold text-lg">Process (Y)</span>
      </Html>
      
      {timeMarkers.map(time => {
        const xPos = (time / totalTime) * 16 - 8;
        return (
          <group key={`time-${time}`}>
            <Line
              points={[[xPos, 0.05, -1.5], [xPos, 0.05, -1.8]]}
              color="#00ffff"
              lineWidth={2}
            />
            <Html position={[xPos, 0, -2.3]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
              <span className="text-sm font-mono font-bold text-cyan-400 bg-black/50 px-1.5 py-0.5 rounded">
                {time}
              </span>
            </Html>
          </group>
        );
      })}
      
      <mesh position={[-8, 0.02, -1.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Html position={[-8.8, 0, -2]} center style={{ pointerEvents: 'none' }}>
        <span className="text-white font-bold text-sm bg-black/50 px-1.5 py-0.5 rounded">0</span>
      </Html>
    </group>
  );
}

interface CharacterControllerProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  algorithm: string;
  isExplaining: boolean;
  totalTime: number;
  onBlockPlace: (blockIndex: number) => void;
}

function CharacterController({
  ganttChart,
  processes,
  algorithm,
  isExplaining,
  totalTime,
  onBlockPlace
}: CharacterControllerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [characterPosition, setCharacterPosition] = useState<[number, number, number]>([-12, 0, 0]);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([-12, 0, 0]);
  const [characterAnimation, setCharacterAnimation] = useState<'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk'>('idle');
  const [speechText, setSpeechText] = useState('');
  const [holdingBlock, setHoldingBlock] = useState<{ color: string; width: number } | null>(null);
  const [waitingForWalk, setWaitingForWalk] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const steps = useMemo(() => 
    generateAlgorithmSteps(ganttChart, processes, algorithm, totalTime),
    [ganttChart, processes, algorithm, totalTime]
  );
  
  const advanceStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [steps.length]);
  
  const handleReachedTarget = useCallback(() => {
    if (waitingForWalk) {
      setWaitingForWalk(false);
      advanceStep();
    }
  }, [waitingForWalk, advanceStep]);
  
  const processStep = useCallback((stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;
    
    setSpeechText(step.message);
    
    if (step.targetPosition) {
      setTargetPosition(step.targetPosition);
    }
    
    switch (step.type) {
      case 'intro':
        setCharacterAnimation('wave');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(advanceStep, step.duration);
        break;
        
      case 'explain':
        setCharacterAnimation('explain');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(advanceStep, step.duration);
        break;
        
      case 'walk_to_pickup':
        setCharacterAnimation('walk');
        setWaitingForWalk(true);
        break;
        
      case 'pickup':
        setCharacterAnimation('pickup');
        if (step.blockIndex !== undefined) {
          const block = ganttChart[step.blockIndex];
          const process = processes.find(p => p.id === block.processId);
          if (process) {
            const width = ((block.endTime - block.startTime) / totalTime) * 16;
            setTimeout(() => {
              setHoldingBlock({ color: process.color, width });
            }, 500);
          }
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(advanceStep, step.duration);
        break;
        
      case 'walk_to_place':
        setCharacterAnimation('walk');
        setWaitingForWalk(true);
        break;
        
      case 'place':
        setCharacterAnimation('place');
        if (step.blockIndex !== undefined) {
          setTimeout(() => {
            setHoldingBlock(null);
            onBlockPlace(step.blockIndex!);
          }, 600);
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(advanceStep, step.duration);
        break;
        
      case 'complete':
        setCharacterAnimation('wave');
        setHoldingBlock(null);
        break;
    }
  }, [steps, ganttChart, processes, totalTime, advanceStep, onBlockPlace]);
  
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isExplaining) {
      setCurrentStepIndex(0);
      setHoldingBlock(null);
      setSpeechText('');
      setCharacterAnimation('idle');
      const centerZ = (processes.length - 1) * 1.25;
      setCharacterPosition([-12, 0, centerZ]);
      setTargetPosition([-12, 0, centerZ]);
      setWaitingForWalk(false);
      return;
    }
    
    processStep(currentStepIndex);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentStepIndex, isExplaining, processStep, processes.length]);
  
  useEffect(() => {
    if (isExplaining) {
      const centerZ = (processes.length - 1) * 1.25;
      setCharacterPosition([-12, 0, centerZ]);
      setTargetPosition([-12, 0, centerZ]);
    }
  }, [isExplaining, processes.length]);
  
  return (
    <>
      <Character3D
        position={characterPosition}
        targetPosition={targetPosition}
        animation={characterAnimation}
        holdingBlock={holdingBlock}
        onReachedTarget={handleReachedTarget}
      />
      <SpeechBubble
        text={speechText}
        position={targetPosition}
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
  const controlsRef = useRef<any>(null);
  
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
    }, 600);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 25, 15]} intensity={1.5} castShadow />
      <pointLight position={[-15, 20, -10]} intensity={0.8} color="#22d3ee" />
      <spotLight position={[0, 30, zCenter]} angle={0.5} penumbra={1} intensity={1} color="#fff5f5" />
      <pointLight position={[-18, 8, zCenter]} intensity={0.6} color="#FF69B4" />
      
      <Stars radius={200} depth={80} count={4000} factor={6} saturation={0} fade speed={0.3} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, zCenter]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a1a" opacity={0.98} transparent />
      </mesh>
      
      <gridHelper args={[50, 50, '#1e1e3a', '#161628']} position={[0, 0.01, zCenter]} />
      
      <AxisSystem totalTime={totalTime} processCount={processes.length} />
      
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
      
      <CharacterController
        ganttChart={ganttChart}
        processes={processes}
        algorithm={algorithm}
        isExplaining={isExplaining}
        totalTime={totalTime}
        onBlockPlace={handleBlockPlace}
      />
      
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        panSpeed={1.5}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
        enableDamping={true}
        dampingFactor={0.1}
        screenSpacePanning={true}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
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
  const zCenter = processes.length > 0 ? (processes.length - 1) * 1.25 : 0;
  
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
          position: [0, 15, zCenter + 25],
          fov: 50,
          near: 0.1,
          far: 500
        }}
        gl={{ antialias: true, alpha: true }}
        shadows
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
