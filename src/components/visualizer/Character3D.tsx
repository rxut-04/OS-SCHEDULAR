"use client";

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface CharacterProps {
  position: [number, number, number];
  animation: 'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk';
  holdingBlock?: { color: string; width: number } | null;
}

function RealisticHumanBody({ animation, holdingBlock }: { animation: string; holdingBlock?: { color: string; width: number } | null }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftWristRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftAnkleRef = useRef<THREE.Group>(null);
  const rightAnkleRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * 1.5) * 0.02;
    }
    
    if (torsoRef.current) {
      torsoRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
    }
    
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
      headRef.current.rotation.x = Math.sin(time * 0.25) * 0.04;
      headRef.current.rotation.z = Math.sin(time * 0.35) * 0.02;
    }
    
    if (eyesRef.current) {
      const blinkCycle = time % 3.5;
      eyesRef.current.scale.y = blinkCycle < 0.12 ? 0.15 : 1;
    }
    
    if (mouthRef.current) {
      if (animation === 'explain' || animation === 'intro') {
        mouthRef.current.scale.y = 0.8 + Math.sin(time * 8) * 0.4;
        mouthRef.current.scale.x = 1 + Math.sin(time * 6) * 0.1;
      } else {
        mouthRef.current.scale.y = 1;
        mouthRef.current.scale.x = 1;
      }
    }
    
    const shoulderSwing = { left: 0, right: 0 };
    const elbowBend = { left: 0, right: 0 };
    const wristRotation = { left: 0, right: 0 };
    const hipSwing = { left: 0, right: 0 };
    const kneeBend = { left: 0, right: 0 };
    
    switch (animation) {
      case 'idle':
        shoulderSwing.left = Math.sin(time * 1.2) * 0.05;
        shoulderSwing.right = Math.sin(time * 1.2 + Math.PI) * 0.05;
        elbowBend.left = -0.2 + Math.sin(time * 0.8) * 0.05;
        elbowBend.right = -0.2 + Math.sin(time * 0.8 + Math.PI) * 0.05;
        break;
        
      case 'wave':
        shoulderSwing.right = -2.5;
        elbowBend.right = -1.8 + Math.sin(time * 10) * 0.3;
        wristRotation.right = Math.sin(time * 12) * 0.5;
        shoulderSwing.left = 0.1;
        elbowBend.left = -0.3;
        break;
        
      case 'point':
        shoulderSwing.right = -1.8;
        elbowBend.right = -0.3;
        wristRotation.right = 0;
        shoulderSwing.left = 0.2;
        elbowBend.left = -0.4;
        break;
        
      case 'pickup':
        const pickPhase = (Math.sin(time * 2.5) + 1) / 2;
        shoulderSwing.left = -1.2 - pickPhase * 0.8;
        shoulderSwing.right = -1.2 - pickPhase * 0.8;
        elbowBend.left = -1.5 - pickPhase * 0.5;
        elbowBend.right = -1.5 - pickPhase * 0.5;
        if (torsoRef.current) {
          torsoRef.current.rotation.x = pickPhase * 0.15;
        }
        break;
        
      case 'place':
        const placePhase = (Math.sin(time * 2) + 1) / 2;
        shoulderSwing.left = -0.8 - placePhase * 0.6;
        shoulderSwing.right = -0.8 - placePhase * 0.6;
        elbowBend.left = -1.2 - placePhase * 0.4;
        elbowBend.right = -1.2 - placePhase * 0.4;
        break;
        
      case 'explain':
        shoulderSwing.left = -0.8 + Math.sin(time * 2) * 0.4;
        shoulderSwing.right = -0.8 + Math.sin(time * 2 + 1.5) * 0.4;
        elbowBend.left = -1.2 + Math.sin(time * 2.5) * 0.3;
        elbowBend.right = -1.2 + Math.sin(time * 2.5 + 1) * 0.3;
        wristRotation.left = Math.sin(time * 3) * 0.3;
        wristRotation.right = Math.sin(time * 3 + 1) * 0.3;
        break;
        
      case 'walk':
        const walkCycle = time * 5;
        shoulderSwing.left = Math.sin(walkCycle) * 0.4;
        shoulderSwing.right = Math.sin(walkCycle + Math.PI) * 0.4;
        elbowBend.left = -0.3 - Math.abs(Math.sin(walkCycle)) * 0.3;
        elbowBend.right = -0.3 - Math.abs(Math.sin(walkCycle + Math.PI)) * 0.3;
        hipSwing.left = Math.sin(walkCycle + Math.PI) * 0.5;
        hipSwing.right = Math.sin(walkCycle) * 0.5;
        kneeBend.left = Math.max(0, Math.sin(walkCycle + Math.PI)) * 0.8;
        kneeBend.right = Math.max(0, Math.sin(walkCycle)) * 0.8;
        if (hipsRef.current) {
          hipsRef.current.rotation.y = Math.sin(walkCycle) * 0.08;
          hipsRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.03;
        }
        break;
    }
    
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = shoulderSwing.left;
      leftShoulderRef.current.rotation.z = 0.1;
    }
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x = shoulderSwing.right;
      rightShoulderRef.current.rotation.z = -0.1;
    }
    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x = elbowBend.left;
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = elbowBend.right;
    }
    if (leftWristRef.current) {
      leftWristRef.current.rotation.z = wristRotation.left;
    }
    if (rightWristRef.current) {
      rightWristRef.current.rotation.z = wristRotation.right;
    }
    if (leftHipRef.current) {
      leftHipRef.current.rotation.x = hipSwing.left;
    }
    if (rightHipRef.current) {
      rightHipRef.current.rotation.x = hipSwing.right;
    }
    if (leftKneeRef.current) {
      leftKneeRef.current.rotation.x = kneeBend.left;
    }
    if (rightKneeRef.current) {
      rightKneeRef.current.rotation.x = kneeBend.right;
    }
  });

  const skin = '#F5D0C5';
  const skinDark = '#E8B4A8';
  const hair = '#2C1810';
  const hairHighlight = '#4A2C20';
  const shirt = '#FF6B9D';
  const shirtDark = '#E85A8A';
  const pants = '#1E3A5F';
  const pantsDark = '#152A45';
  const shoes = '#2D2D2D';
  const eyeWhite = '#FFFFFF';
  const iris = '#4A90D9';
  const pupil = '#1A1A1A';
  const lips = '#D4727A';
  const blush = '#FFB5B5';
  
  return (
    <group ref={bodyRef}>
      <group ref={hipsRef} position={[0, 0.95, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        <mesh position={[0, -0.05, 0]} scale={[1.3, 0.6, 0.9]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        
        <group ref={leftHipRef} position={[-0.12, -0.1, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.095, 0.28, 12, 16]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          
          <group ref={leftKneeRef} position={[0, -0.42, 0]}>
            <mesh>
              <sphereGeometry args={[0.085, 16, 12]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.08, 0.28, 12, 16]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            
            <group ref={leftAnkleRef} position={[0, -0.42, 0]}>
              <mesh>
                <sphereGeometry args={[0.065, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.06, 0.06]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.06, 0.18]} />
                <meshStandardMaterial color={shoes} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightHipRef} position={[0.12, -0.1, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.095, 0.28, 12, 16]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          
          <group ref={rightKneeRef} position={[0, -0.42, 0]}>
            <mesh>
              <sphereGeometry args={[0.085, 16, 12]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.08, 0.28, 12, 16]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            
            <group ref={rightAnkleRef} position={[0, -0.42, 0]}>
              <mesh>
                <sphereGeometry args={[0.065, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.06, 0.06]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.06, 0.18]} />
                <meshStandardMaterial color={shoes} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      
      <group ref={torsoRef} position={[0, 1.15, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.2, 0.35, 16, 24]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, 0.35, 0]} scale={[1.15, 0.5, 0.85]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.05, 0]} scale={[0.95, 0.4, 0.8]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        
        <group ref={leftShoulderRef} position={[-0.28, 0.32, 0]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.065, 0.18, 10, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          
          <group ref={leftElbowRef} position={[0, -0.28, 0]}>
            <mesh>
              <sphereGeometry args={[0.055, 12, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.05, 0.16, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            
            <group ref={leftWristRef} position={[0, -0.24, 0]}>
              <mesh>
                <sphereGeometry args={[0.04, 10, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.06, 0.01]} scale={[0.8, 1, 0.5]}>
                <boxGeometry args={[0.08, 0.1, 0.06]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.12, 0.02]}>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              {[[-0.025, 0], [-0.008, 0.01], [0.008, 0.01], [0.025, 0]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.1, z + 0.02]}>
                  <capsuleGeometry args={[0.012, 0.035, 4, 6]} />
                  <meshStandardMaterial color={skin} />
                </mesh>
              ))}
            </group>
          </group>
        </group>
        
        <group ref={rightShoulderRef} position={[0.28, 0.32, 0]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.065, 0.18, 10, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          
          <group ref={rightElbowRef} position={[0, -0.28, 0]}>
            <mesh>
              <sphereGeometry args={[0.055, 12, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.05, 0.16, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            
            <group ref={rightWristRef} position={[0, -0.24, 0]}>
              <mesh>
                <sphereGeometry args={[0.04, 10, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.06, 0.01]} scale={[0.8, 1, 0.5]}>
                <boxGeometry args={[0.08, 0.1, 0.06]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.12, 0.02]}>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              {[[-0.025, 0], [-0.008, 0.01], [0.008, 0.01], [0.025, 0]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.1, z + 0.02]}>
                  <capsuleGeometry args={[0.012, 0.035, 4, 6]} />
                  <meshStandardMaterial color={skin} />
                </mesh>
              ))}
              
              {holdingBlock && (
                <mesh position={[0, -0.2, 0.15]}>
                  <boxGeometry args={[Math.min(holdingBlock.width * 0.25, 0.8), 0.25, 0.35]} />
                  <meshStandardMaterial 
                    color={holdingBlock.color} 
                    emissive={holdingBlock.color}
                    emissiveIntensity={0.3}
                    metalness={0.4}
                    roughness={0.3}
                  />
                </mesh>
              )}
            </group>
          </group>
        </group>
        
        <group ref={neckRef} position={[0, 0.48, 0]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.075, 0.12, 16]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          
          <group ref={headRef} position={[0, 0.22, 0]}>
            <mesh scale={[1, 1.1, 1]}>
              <sphereGeometry args={[0.18, 32, 24]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.02, 0.12]} scale={[0.7, 0.55, 0.4]}>
              <sphereGeometry args={[0.15, 24, 16]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.12, 0.1]} scale={[0.5, 0.35, 0.35]}>
              <sphereGeometry args={[0.12, 16, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            
            <mesh position={[0, 0.08, 0]} scale={[1.08, 0.95, 1.05]}>
              <sphereGeometry args={[0.185, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshStandardMaterial color={hair} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.12, -0.02]} scale={[1.1, 0.5, 1.1]}>
              <sphereGeometry args={[0.18, 32, 16]} />
              <meshStandardMaterial color={hair} />
            </mesh>
            {[-0.12, 0.12].map((x, i) => (
              <mesh key={i} position={[x, 0.02, -0.12]} scale={[0.4, 0.8, 0.6]}>
                <sphereGeometry args={[0.12, 16, 12]} />
                <meshStandardMaterial color={hair} />
              </mesh>
            ))}
            <mesh position={[-0.16, -0.05, 0.06]} rotation={[0.2, 0.3, -0.2]}>
              <capsuleGeometry args={[0.025, 0.35, 8, 12]} />
              <meshStandardMaterial color={hair} />
            </mesh>
            <mesh position={[0.16, -0.05, 0.06]} rotation={[0.2, -0.3, 0.2]}>
              <capsuleGeometry args={[0.025, 0.35, 8, 12]} />
              <meshStandardMaterial color={hair} />
            </mesh>
            <mesh position={[0, 0.18, 0.08]} rotation={[0.3, 0, 0]} scale={[0.8, 0.3, 0.5]}>
              <sphereGeometry args={[0.12, 16, 12]} />
              <meshStandardMaterial color={hairHighlight} />
            </mesh>
            
            <group ref={eyesRef}>
              {[-0.055, 0.055].map((x, i) => (
                <group key={i} position={[x, 0.04, 0.15]}>
                  <mesh scale={[1, 0.9, 0.6]}>
                    <sphereGeometry args={[0.035, 16, 12]} />
                    <meshStandardMaterial color={eyeWhite} />
                  </mesh>
                  <mesh position={[0, 0, 0.02]} scale={[0.7, 0.7, 0.5]}>
                    <sphereGeometry args={[0.028, 16, 12]} />
                    <meshStandardMaterial color={iris} />
                  </mesh>
                  <mesh position={[0, 0, 0.028]}>
                    <sphereGeometry args={[0.012, 12, 8]} />
                    <meshStandardMaterial color={pupil} />
                  </mesh>
                  <mesh position={[0.006, 0.006, 0.03]}>
                    <sphereGeometry args={[0.004, 8, 6]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
                  </mesh>
                </group>
              ))}
            </group>
            
            {[-0.055, 0.055].map((x, i) => (
              <mesh key={i} position={[x, 0.085, 0.14]} rotation={[0.1, i === 0 ? 0.1 : -0.1, i === 0 ? -0.15 : 0.15]}>
                <boxGeometry args={[0.05, 0.012, 0.02]} />
                <meshStandardMaterial color={hair} />
              </mesh>
            ))}
            
            <mesh position={[0, -0.02, 0.17]} rotation={[0.2, 0, 0]}>
              <sphereGeometry args={[0.022, 12, 8]} />
              <meshStandardMaterial color={skinDark} />
            </mesh>
            
            <mesh ref={mouthRef} position={[0, -0.08, 0.14]} rotation={[0.1, 0, 0]} scale={[1, 0.6, 0.5]}>
              <capsuleGeometry args={[0.02, 0.03, 8, 12]} />
              <meshStandardMaterial color={lips} />
            </mesh>
            
            {[-0.1, 0.1].map((x, i) => (
              <mesh key={i} position={[x, -0.02, 0.145]} scale={[0.8, 0.5, 0.3]}>
                <sphereGeometry args={[0.035, 12, 8]} />
                <meshStandardMaterial color={blush} transparent opacity={0.4} />
              </mesh>
            ))}
            
            {[-0.13, 0.13].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.08]} scale={[0.3, 0.5, 0.2]}>
                <sphereGeometry args={[0.04, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export function Character3D({ position, animation, holdingBlock }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.PI;
    }
  });
  
  return (
    <group ref={groupRef} position={position} scale={[1.5, 1.5, 1.5]}>
      <RealisticHumanBody animation={animation} holdingBlock={holdingBlock} />
      <pointLight position={[0, 2.5, 2]} intensity={0.6} color="#FFE8E0" distance={6} />
      <pointLight position={[-1, 1.5, 1]} intensity={0.3} color="#87CEEB" distance={4} />
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
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl border-2 border-pink-300 max-w-[320px]">
          <p className="text-gray-800 text-sm font-medium leading-relaxed">{text}</p>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white/95 rotate-45 border-r-2 border-b-2 border-pink-300" />
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
    message: `Hello! I'm your AI guide. Today I'll explain how ${algorithm} scheduling algorithm works. Watch carefully!`,
    duration: 4000
  });
  
  const algorithmExplanations: Record<string, string> = {
    'FCFS': 'First Come First Serve is the simplest scheduling algorithm. Processes are executed in the exact order they arrive in the ready queue. While fair and easy to implement, it can cause the "convoy effect" where short processes wait behind long ones.',
    'SJF': 'Shortest Job First selects the process with the smallest burst time next. This algorithm gives the minimum average waiting time but requires knowing burst times in advance, which is often impractical.',
    'SRTF': 'Shortest Remaining Time First is the preemptive version of SJF. If a new process arrives with a shorter burst time than the remaining time of the current process, we switch! This gives optimal average waiting time.',
    'Priority': 'Priority Scheduling assigns a priority number to each process. Lower numbers typically mean higher priority. The CPU is allocated to the highest priority process. Watch out for starvation of low priority processes!',
    'Round Robin': 'Round Robin is designed for time-sharing systems. Each process gets a small unit of CPU time called a time quantum. After this time, the process is preempted and added to the end of the ready queue. Very fair!',
    'First Come First Serve (FCFS)': 'First Come First Serve is the simplest scheduling algorithm. Processes are executed in the exact order they arrive in the ready queue. While fair and easy to implement, it can cause the "convoy effect" where short processes wait behind long ones.',
    'Shortest Job First (SJF)': 'Shortest Job First selects the process with the smallest burst time next. This algorithm gives the minimum average waiting time but requires knowing burst times in advance.',
    'Shortest Remaining Time First (SRTF)': 'Shortest Remaining Time First is preemptive SJF. If a new process arrives with shorter remaining time, we switch immediately! This is optimal for average waiting time.',
    'Priority Scheduling': 'Priority Scheduling assigns priority numbers to processes. The CPU goes to the highest priority process. Aging can prevent starvation of low priority processes.',
    'default': 'This CPU scheduling algorithm determines which process gets the CPU next and for how long. Let me demonstrate!'
  };
  
  steps.push({
    type: 'explain',
    message: algorithmExplanations[algorithm] || algorithmExplanations['default'],
    duration: 6000
  });
  
  steps.push({
    type: 'explain',
    message: `Now let me show you how each process block is scheduled. I'll pick up each process and place it on the timeline according to ${algorithm}'s rules!`,
    duration: 3500
  });
  
  ganttChart.forEach((block, index) => {
    const process = processes.find(p => p.id === block.processId);
    if (!process) return;
    
    steps.push({
      type: 'pickup',
      message: `Taking ${block.processId}... Burst time needed: ${block.endTime - block.startTime} units.`,
      blockIndex: index,
      processId: block.processId,
      duration: 2000
    });
    
    steps.push({
      type: 'place',
      message: `Placing ${block.processId} from time ${block.startTime} to ${block.endTime}!`,
      blockIndex: index,
      processId: block.processId,
      duration: 2000
    });
  });
  
  const avgWaiting = processes.length > 0 
    ? processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / processes.length 
    : 0;
  const avgTurnaround = processes.length > 0 
    ? processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / processes.length 
    : 0;
  
  steps.push({
    type: 'complete',
    message: `All done! 🎉 Average waiting time: ${avgWaiting.toFixed(2)} | Average turnaround time: ${avgTurnaround.toFixed(2)}. Great job learning ${algorithm}!`,
    duration: 5000
  });
  
  return steps;
}
