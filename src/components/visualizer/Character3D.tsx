"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface CharacterProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  animation: 'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk';
  holdingBlock?: { color: string; width: number } | null;
  onReachedTarget?: () => void;
}

function SlimFemaleModel({ animation, holdingBlock }: { animation: string; holdingBlock?: { color: string; width: number } | null }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftCalfRef = useRef<THREE.Group>(null);
  const rightCalfRef = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (bodyRef.current) {
      bodyRef.current.position.y = animation === 'walk' 
        ? Math.abs(Math.sin(t * 8)) * 0.025 
        : Math.sin(t * 1.5) * 0.008;
    }
    
    if (hipsRef.current && animation === 'walk') {
      hipsRef.current.rotation.y = Math.sin(t * 8) * 0.1;
      hipsRef.current.rotation.z = Math.sin(t * 8) * 0.03;
    }
    
    if (torsoRef.current) {
      if (animation === 'walk') {
        torsoRef.current.rotation.y = Math.sin(t * 8 + Math.PI) * 0.05;
      } else if (animation === 'idle') {
        torsoRef.current.rotation.y = Math.sin(t * 0.5) * 0.02;
      }
    }
    
    if (headRef.current) {
      if (animation === 'idle') {
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.08;
        headRef.current.rotation.x = Math.sin(t * 0.3) * 0.04;
      } else if (animation === 'walk') {
        headRef.current.rotation.y = Math.sin(t * 4) * 0.03;
      } else if (animation === 'explain' || animation === 'wave') {
        headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
      }
    }
    
    if (hairRef.current) {
      hairRef.current.rotation.x = animation === 'walk' 
        ? Math.sin(t * 8) * 0.05 
        : Math.sin(t * 0.8) * 0.015;
    }
    
    let leftArmRot = 0, rightArmRot = 0;
    let leftForearmRot = -0.1, rightForearmRot = -0.1;
    let leftLegRot = 0, rightLegRot = 0;
    let leftCalfRot = 0, rightCalfRot = 0;
    
    switch (animation) {
      case 'idle':
        leftArmRot = Math.sin(t * 0.8) * 0.03;
        rightArmRot = Math.sin(t * 0.8 + Math.PI) * 0.03;
        break;
        
      case 'wave':
        rightArmRot = -2.8;
        rightForearmRot = -1.8 + Math.sin(t * 10) * 0.4;
        leftArmRot = 0.1;
        break;
        
      case 'explain':
        leftArmRot = -0.8 + Math.sin(t * 2) * 0.3;
        rightArmRot = -0.8 + Math.sin(t * 2 + 1) * 0.3;
        leftForearmRot = -1.2 + Math.sin(t * 2.5) * 0.25;
        rightForearmRot = -1.2 + Math.sin(t * 2.5 + 0.8) * 0.25;
        break;
        
      case 'pickup':
      case 'place':
        const phase = (Math.sin(t * 2.5) + 1) / 2;
        leftArmRot = -0.6 - phase * 0.4;
        rightArmRot = -0.6 - phase * 0.4;
        leftForearmRot = -1.0 - phase * 0.3;
        rightForearmRot = -1.0 - phase * 0.3;
        break;
        
      case 'walk':
        const w = t * 8;
        leftArmRot = Math.sin(w) * 0.4;
        rightArmRot = Math.sin(w + Math.PI) * 0.4;
        leftForearmRot = -0.3 - Math.abs(Math.sin(w)) * 0.2;
        rightForearmRot = -0.3 - Math.abs(Math.sin(w + Math.PI)) * 0.2;
        leftLegRot = Math.sin(w + Math.PI) * 0.5;
        rightLegRot = Math.sin(w) * 0.5;
        leftCalfRot = Math.max(0, Math.sin(w + Math.PI)) * 0.7;
        rightCalfRot = Math.max(0, Math.sin(w)) * 0.7;
        break;
    }
    
    if (leftArmRef.current) leftArmRef.current.rotation.x = leftArmRot;
    if (rightArmRef.current) rightArmRef.current.rotation.x = rightArmRot;
    if (leftForearmRef.current) leftForearmRef.current.rotation.x = leftForearmRot;
    if (rightForearmRef.current) rightForearmRef.current.rotation.x = rightForearmRot;
    if (leftLegRef.current) leftLegRef.current.rotation.x = leftLegRot;
    if (rightLegRef.current) rightLegRef.current.rotation.x = rightLegRot;
    if (leftCalfRef.current) leftCalfRef.current.rotation.x = leftCalfRot;
    if (rightCalfRef.current) rightCalfRef.current.rotation.x = rightCalfRot;
  });

  const skin = '#F5D0C5';
  const skinDark = '#E8B8A8';
  const hair = '#1a0a00';
  const hairLight = '#2d1810';
  const top = '#E91E63';
  const topDark = '#C2185B';
  const skirt = '#1a1a2e';
  const heels = '#1a1a1a';
  const lips = '#D4616A';
  const eyeColor = '#4A7C59';
  
  return (
    <group ref={bodyRef}>
      <group ref={hipsRef} position={[0, 0.95, 0]}>
        <mesh scale={[1, 0.6, 0.85]}>
          <sphereGeometry args={[0.14, 24, 18]} />
          <meshStandardMaterial color={skirt} />
        </mesh>
        <mesh position={[0, -0.08, 0]} scale={[1.1, 0.8, 0.9]}>
          <cylinderGeometry args={[0.12, 0.16, 0.18, 20]} />
          <meshStandardMaterial color={skirt} />
        </mesh>
        
        <group ref={leftLegRef} position={[-0.065, -0.12, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.05, 0.18, 10, 14]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <group ref={leftCalfRef} position={[0, -0.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.042, 12, 10]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.038, 0.18, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group position={[0, -0.28, 0]}>
              <mesh position={[0, -0.03, 0.03]} rotation={[0.2, 0, 0]} scale={[0.6, 0.35, 1.1]}>
                <boxGeometry args={[0.07, 0.045, 0.11]} />
                <meshStandardMaterial color={heels} />
              </mesh>
              <mesh position={[0, -0.06, -0.02]}>
                <cylinderGeometry args={[0.015, 0.012, 0.06, 8]} />
                <meshStandardMaterial color={heels} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightLegRef} position={[0.065, -0.12, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.05, 0.18, 10, 14]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <group ref={rightCalfRef} position={[0, -0.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.042, 12, 10]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.038, 0.18, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group position={[0, -0.28, 0]}>
              <mesh position={[0, -0.03, 0.03]} rotation={[0.2, 0, 0]} scale={[0.6, 0.35, 1.1]}>
                <boxGeometry args={[0.07, 0.045, 0.11]} />
                <meshStandardMaterial color={heels} />
              </mesh>
              <mesh position={[0, -0.06, -0.02]}>
                <cylinderGeometry args={[0.015, 0.012, 0.06, 8]} />
                <meshStandardMaterial color={heels} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      
      <group ref={torsoRef} position={[0, 1.12, 0]}>
        <mesh position={[0, 0, 0]} scale={[0.85, 1, 0.7]}>
          <capsuleGeometry args={[0.1, 0.12, 12, 18]} />
          <meshStandardMaterial color={top} />
        </mesh>
        <mesh position={[0, 0.12, 0]} scale={[0.95, 0.6, 0.75]}>
          <sphereGeometry args={[0.12, 20, 16]} />
          <meshStandardMaterial color={top} />
        </mesh>
        <mesh position={[0, 0.2, 0.04]} scale={[0.7, 0.25, 0.4]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        
        <group ref={leftArmRef} position={[-0.15, 0.14, 0]}>
          <mesh position={[0, -0.08, 0]}>
            <capsuleGeometry args={[0.028, 0.1, 8, 10]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <group ref={leftForearmRef} position={[0, -0.16, 0]}>
            <mesh>
              <sphereGeometry args={[0.024, 10, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <capsuleGeometry args={[0.022, 0.1, 8, 10]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group ref={leftHandRef} position={[0, -0.15, 0]}>
              <mesh scale={[0.6, 0.8, 0.35]}>
                <boxGeometry args={[0.04, 0.05, 0.025]} />
                <meshStandardMaterial color={skin} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightArmRef} position={[0.15, 0.14, 0]}>
          <mesh position={[0, -0.08, 0]}>
            <capsuleGeometry args={[0.028, 0.1, 8, 10]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <group ref={rightForearmRef} position={[0, -0.16, 0]}>
            <mesh>
              <sphereGeometry args={[0.024, 10, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <capsuleGeometry args={[0.022, 0.1, 8, 10]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group ref={rightHandRef} position={[0, -0.15, 0]}>
              <mesh scale={[0.6, 0.8, 0.35]}>
                <boxGeometry args={[0.04, 0.05, 0.025]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              {holdingBlock && (
                <mesh position={[0, -0.08, 0.08]}>
                  <boxGeometry args={[Math.min(holdingBlock.width * 0.15, 0.4), 0.14, 0.2]} />
                  <meshStandardMaterial 
                    color={holdingBlock.color} 
                    emissive={holdingBlock.color}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              )}
            </group>
          </group>
        </group>
        
        <group ref={neckRef} position={[0, 0.24, 0]}>
          <mesh>
            <cylinderGeometry args={[0.032, 0.038, 0.06, 14]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          
          <group ref={headRef} position={[0, 0.1, 0]}>
            <mesh scale={[0.78, 0.95, 0.82]}>
              <sphereGeometry args={[0.1, 28, 22]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.04, 0.055]} scale={[0.5, 0.35, 0.3]}>
              <sphereGeometry args={[0.06, 18, 14]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.055, 0.06]} scale={[0.55, 0.22, 0.3]}>
              <sphereGeometry args={[0.05, 16, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.025, 0.08]} scale={[0.2, 0.15, 0.12]}>
              <sphereGeometry args={[0.03, 12, 10]} />
              <meshStandardMaterial color={skinDark} />
            </mesh>
            
            <group ref={hairRef}>
              <mesh position={[0, 0.025, 0]} scale={[1.02, 0.82, 0.96]}>
                <sphereGeometry args={[0.102, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.04, 0]} scale={[1.03, 0.35, 1]}>
                <sphereGeometry args={[0.1, 24, 18]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {[-1, 1].map((side, i) => (
                <group key={i}>
                  <mesh position={[side * 0.08, -0.02, -0.04]} scale={[0.3, 0.7, 0.45]}>
                    <sphereGeometry args={[0.08, 16, 12]} />
                    <meshStandardMaterial color={hair} />
                  </mesh>
                  <mesh 
                    position={[side * 0.09, -0.1, 0.01]} 
                    rotation={[0.1, side * -0.1, side * 0.1]}
                  >
                    <capsuleGeometry args={[0.012, 0.25, 8, 10]} />
                    <meshStandardMaterial color={hair} />
                  </mesh>
                  <mesh 
                    position={[side * 0.085, -0.18, 0.02]} 
                    rotation={[0.08, side * -0.08, side * 0.08]}
                  >
                    <capsuleGeometry args={[0.01, 0.22, 8, 10]} />
                    <meshStandardMaterial color={hairLight} />
                  </mesh>
                </group>
              ))}
            </group>
            
            {[-1, 1].map((side, i) => (
              <group key={i} position={[side * 0.032, 0.015, 0.075]}>
                <mesh scale={[1, 0.7, 0.45]}>
                  <sphereGeometry args={[0.018, 14, 10]} />
                  <meshStandardMaterial color="#FFFAF5" />
                </mesh>
                <mesh position={[0, 0, 0.008]} scale={[0.6, 0.6, 0.4]}>
                  <sphereGeometry args={[0.012, 12, 10]} />
                  <meshStandardMaterial color={eyeColor} />
                </mesh>
                <mesh position={[0, 0, 0.012]}>
                  <sphereGeometry args={[0.005, 10, 8]} />
                  <meshStandardMaterial color="#0a0a0a" />
                </mesh>
                <mesh position={[0.002, 0.002, 0.014]}>
                  <sphereGeometry args={[0.0015, 6, 4]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
                </mesh>
              </group>
            ))}
            
            {[-1, 1].map((side, i) => (
              <mesh 
                key={i}
                position={[side * 0.032, 0.038, 0.07]} 
                rotation={[0.1, side * 0.05, side * -0.1]}
                scale={[1.1, 0.15, 0.12]}
              >
                <capsuleGeometry args={[0.004, 0.022, 6, 8]} />
                <meshStandardMaterial color={hair} />
              </mesh>
            ))}
            
            <mesh position={[0, -0.035, 0.07]} scale={[0.9, 0.4, 0.35]}>
              <capsuleGeometry args={[0.008, 0.012, 8, 10]} />
              <meshStandardMaterial color={lips} />
            </mesh>
            
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[side * 0.055, 0, 0.045]} scale={[0.18, 0.3, 0.12]}>
                <sphereGeometry args={[0.022, 10, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export function Character3D({ position, targetPosition, animation, holdingBlock, onReachedTarget }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const isWalking = useRef(false);
  const currentRotation = useRef(Math.PI);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const target = new THREE.Vector3(...targetPosition);
    const current = currentPos.current;
    const distance = current.distanceTo(target);
    
    if (distance > 0.1) {
      isWalking.current = true;
      const speed = 3.0;
      const direction = target.clone().sub(current).normalize();
      const movement = direction.multiplyScalar(Math.min(speed * delta, distance));
      current.add(movement);
      
      const targetAngle = Math.atan2(direction.x, direction.z);
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.15;
      groupRef.current.rotation.y = currentRotation.current;
    } else {
      if (isWalking.current) {
        isWalking.current = false;
        onReachedTarget?.();
      }
      const idleAngle = Math.PI * 0.15;
      let angleDiff = idleAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.08;
      groupRef.current.rotation.y = currentRotation.current;
    }
    
    groupRef.current.position.copy(current);
  });
  
  const effectiveAnimation = isWalking.current ? 'walk' : animation;
  
  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI * 0.15, 0]} scale={[1.6, 1.6, 1.6]}>
      <SlimFemaleModel animation={effectiveAnimation} holdingBlock={holdingBlock} />
      <pointLight position={[0, 1.8, 1.2]} intensity={0.5} color="#FFF8F0" distance={5} />
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
    <Html 
      position={[position[0], position[1] + 4.5, position[2]]} 
      center 
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <div className="relative animate-fadeIn" style={{ transform: 'translateY(-100%)' }}>
        <div 
          className="bg-gradient-to-br from-white via-white to-pink-50 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-2xl border-2 border-pink-300/50"
          style={{ 
            minWidth: '320px',
            maxWidth: '450px',
            boxShadow: '0 10px 40px rgba(233, 30, 99, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)'
          }}
        >
          <p className="text-gray-800 text-sm font-medium leading-relaxed text-center">{text}</p>
        </div>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: '-12px',
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '14px solid white',
            filter: 'drop-shadow(0 2px 4px rgba(233, 30, 99, 0.2))'
          }}
        />
      </div>
    </Html>
  );
}

export interface AlgorithmStep {
  type: 'intro' | 'explain' | 'walk_to_pickup' | 'pickup' | 'walk_to_place' | 'place' | 'complete';
  message: string;
  blockIndex?: number;
  processId?: string;
  targetPosition?: [number, number, number];
  duration: number;
}

export function generateAlgorithmSteps(
  ganttChart: GanttBlock[],
  processes: Process[],
  algorithm: string,
  totalTime: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const startX = -12;
  const centerZ = (processes.length - 1) * 1.25;
  
  steps.push({
    type: 'intro',
    message: `Hello! I'm your AI guide. Let me explain how ${algorithm} scheduling works!`,
    targetPosition: [startX, 0, centerZ],
    duration: 3500
  });
  
  const explanations: Record<string, string> = {
    'FCFS': 'First Come First Serve executes processes in arrival order. Simple but can cause convoy effect!',
    'SJF': 'Shortest Job First picks the smallest burst time. Optimal average waiting but needs prediction!',
    'SRTF': 'Shortest Remaining Time First preempts if a shorter job arrives. Truly optimal!',
    'Priority': 'Priority Scheduling runs highest priority first. Watch for starvation!',
    'Round Robin': 'Round Robin gives each process a time quantum. Fair and responsive!',
    'First Come First Serve (FCFS)': 'FCFS executes in arrival order. Simple and fair, but convoy effect possible!',
    'Shortest Job First (SJF)': 'SJF picks smallest burst time. Minimizes average waiting time!',
    'Shortest Remaining Time First (SRTF)': 'SRTF preempts for shorter jobs. Optimal average waiting!',
    'Priority Scheduling': 'Priority runs important processes first. Use aging to prevent starvation!',
    'default': 'This algorithm determines CPU allocation. Watch as I demonstrate!'
  };
  
  steps.push({
    type: 'explain',
    message: explanations[algorithm] || explanations['default'],
    targetPosition: [startX, 0, centerZ],
    duration: 5000
  });
  
  steps.push({
    type: 'explain',
    message: "Now watch me walk through the graph and place each process block on the timeline!",
    targetPosition: [startX, 0, centerZ],
    duration: 3000
  });
  
  ganttChart.forEach((block, index) => {
    const process = processes.find(p => p.id === block.processId);
    if (!process) return;
    
    const rowIndex = processes.findIndex(p => p.id === block.processId);
    const pickupZ = rowIndex * 2.5;
    const blockX = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
    
    steps.push({
      type: 'walk_to_pickup',
      message: `Walking to get ${block.processId}...`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [-11, 0, pickupZ],
      duration: 2500
    });
    
    steps.push({
      type: 'pickup',
      message: `Picking up ${block.processId}! Duration: ${block.endTime - block.startTime} units`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [-11, 0, pickupZ],
      duration: 1500
    });
    
    steps.push({
      type: 'walk_to_place',
      message: `Carrying ${block.processId} to timeline position ${block.startTime}-${block.endTime}...`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [blockX, 0, pickupZ + 3],
      duration: 3000
    });
    
    steps.push({
      type: 'place',
      message: `Placed ${block.processId} at time ${block.startTime} to ${block.endTime}!`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [blockX, 0, pickupZ + 3],
      duration: 1500
    });
  });
  
  let totalWait = 0;
  let totalTurnaround = 0;
  let validCount = 0;
  
  processes.forEach(p => {
    if (typeof p.waitingTime === 'number' && !isNaN(p.waitingTime)) {
      totalWait += p.waitingTime;
      validCount++;
    }
    if (typeof p.turnaroundTime === 'number' && !isNaN(p.turnaroundTime)) {
      totalTurnaround += p.turnaroundTime;
    }
  });
  
  const avgWait = validCount > 0 ? totalWait / validCount : 0;
  const avgTurn = validCount > 0 ? totalTurnaround / validCount : 0;
  
  const message = avgWait > 0 || avgTurn > 0
    ? `All done! Avg Wait: ${avgWait.toFixed(1)} | Avg Turnaround: ${avgTurn.toFixed(1)}. Great job learning ${algorithm}!`
    : `All done! I've placed all ${ganttChart.length} blocks. Great job learning ${algorithm}!`;
  
  steps.push({
    type: 'complete',
    message,
    targetPosition: [startX, 0, centerZ],
    duration: 5000
  });
  
  return steps;
}
