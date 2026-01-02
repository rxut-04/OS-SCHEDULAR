"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface ProcessBarProps {
  block: GanttBlock;
  process: Process;
  totalTime: number;
  rowIndex: number;
  isActive: boolean;
  isPast: boolean;
}

function ProcessBar({ block, process, totalTime, rowIndex, isActive, isPast }: ProcessBarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const width = ((block.endTime - block.startTime) / totalTime) * 10;
  const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 10 - 5;
  const zPos = rowIndex * 1.5;
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
    if (glowRef.current && isActive) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  const opacity = isPast || isActive ? 1 : 0.3;

  return (
    <group position={[xPos, 0.4, zPos]}>
      <RoundedBox
        ref={meshRef}
        args={[width, 0.6, 0.8]}
        radius={0.08}
        smoothness={4}
      >
        <meshStandardMaterial
          color={process.color}
          transparent
          opacity={opacity}
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>
      
      {isActive && (
        <mesh ref={glowRef} scale={[1.1, 1.1, 1.1]}>
          <boxGeometry args={[width, 0.6, 0.8]} />
          <meshBasicMaterial
            color={process.color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
      
      <Text
        position={[0, 0, 0.45]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {block.endTime - block.startTime}
      </Text>
    </group>
  );
}

function TimelineMarker({ time, totalTime, animatedTime }: { time: number; totalTime: number; animatedTime: number }) {
  const xPos = (time / totalTime) * 10 - 5;
  const isActive = animatedTime >= time;
  
  return (
    <group position={[xPos, 0, -1]}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.3]} />
        <meshBasicMaterial color={isActive ? "#6366f1" : "#444"} />
      </mesh>
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.2}
        color={isActive ? "#6366f1" : "#666"}
        anchorX="center"
        anchorY="top"
      >
        {time}
      </Text>
    </group>
  );
}

function TimeIndicator({ animatedTime, totalTime, processCount }: { animatedTime: number; totalTime: number; processCount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const xPos = (animatedTime / totalTime) * 10 - 5;
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  
  if (animatedTime < 0) return null;
  
  return (
    <mesh ref={ref} position={[xPos, 0.5, (processCount - 1) * 0.75]}>
      <boxGeometry args={[0.05, 1.5, processCount * 1.5 + 1]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
    </mesh>
  );
}

function ProcessLabel({ process, rowIndex }: { process: Process; rowIndex: number }) {
  return (
    <group position={[-6, 0.4, rowIndex * 1.5]}>
      <mesh position={[0.3, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={process.color} />
      </mesh>
      <Text
        position={[0.7, 0, 0]}
        fontSize={0.3}
        color={process.color}
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {process.id}
      </Text>
    </group>
  );
}

function Scene({ 
  ganttChart, 
  processes, 
  animatedTime 
}: { 
  ganttChart: GanttBlock[]; 
  processes: Process[]; 
  animatedTime: number;
}) {
  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 1;
  
  const timeMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i <= totalTime; i++) {
      markers.push(i);
    }
    return markers;
  }, [totalTime]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#6366f1" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (processes.length - 1) * 0.75]}>
        <planeGeometry args={[14, processes.length * 1.5 + 2]} />
        <meshStandardMaterial color="#1a1a2e" opacity={0.8} transparent />
      </mesh>
      
      {processes.map((process, index) => (
        <ProcessLabel key={process.id} process={process} rowIndex={index} />
      ))}
      
      {ganttChart.map((block, index) => {
        const process = processes.find(p => p.id === block.processId);
        const rowIndex = processes.findIndex(p => p.id === block.processId);
        if (!process) return null;
        
        const isActive = animatedTime >= block.startTime && animatedTime < block.endTime;
        const isPast = animatedTime >= block.endTime;
        
        return (
          <ProcessBar
            key={index}
            block={block}
            process={process}
            totalTime={totalTime}
            rowIndex={rowIndex}
            isActive={isActive}
            isPast={isPast}
          />
        );
      })}
      
      {timeMarkers.map(time => (
        <TimelineMarker 
          key={time} 
          time={time} 
          totalTime={totalTime} 
          animatedTime={animatedTime}
        />
      ))}
      
      <TimeIndicator 
        animatedTime={animatedTime} 
        totalTime={totalTime}
        processCount={processes.length}
      />
      
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate={false}
      />
    </>
  );
}

interface GanttChart3DProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  animatedTime: number;
}

export function GanttChart3D({ ganttChart, processes, animatedTime }: GanttChart3DProps) {
  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden bg-[#0a0a15]">
      <Canvas
        camera={{ 
          position: [0, 8, 10], 
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene 
          ganttChart={ganttChart} 
          processes={processes} 
          animatedTime={animatedTime}
        />
      </Canvas>
    </div>
  );
}
