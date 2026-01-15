"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import type React from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BlurEffect from "react-progressive-blur";

interface HelixRingsProps {
  levelsUp?: number;
  levelsDown?: number;
  stepY?: number;
  rotationStep?: number;
}

const HelixRings: React.FC<HelixRingsProps> = ({
  levelsUp = 10,
  levelsDown = 10,
  stepY = 0.85,
  rotationStep = Math.PI / 16,
}) => {
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.35;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const depth = 10;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 64,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth / 2);

    return geometry;
  }, []);

  const elements = [];
  for (let i = -levelsDown; i <= levelsUp; i++) {
    elements.push({
      id: `helix-ring-${i}`,
      y: i * stepY,
      rotation: i * rotationStep,
    });
  }

  return (
    <group
      scale={1}
      position={[5, 0, 0]}
      ref={groupRef}
      rotation={[0, 0, 0]}
    >
      {elements.map((el) => (
        <mesh
          key={el.id}
          geometry={ringGeometry}
          position={[0, el.y, 0]}
          rotation={[0, Math.PI / 2 + el.rotation, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#45BFD3"
            metalness={0.7}
            roughness={0.5}
            clearcoat={0}
            clearcoatRoughness={0.15}
            reflectivity={0}
            iridescence={0.96}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC = () => {
  return (
    <Canvas
      className="h-full w-full"
      orthographic
      shadows
      camera={{
        zoom: 70,
        position: [0, 0, 7],
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
      style={{ background: "#000000" }}
    >
      <hemisphereLight
        color={"#cfe8ff"}
        groundColor={"#000000"}
        intensity={2}
      />

      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        color={"#ffeedd"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <HelixRings />

      <EffectComposer multisampling={8}>
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
};

export function HelixBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-black">
       <div className="absolute inset-0 z-0">
         <Scene />
       </div>
       
       <BlurEffect 
         className="absolute bg-gradient-to-b from-transparent to-black/40 h-1/2 md:h-1/3 w-full bottom-0 z-0" 
         position="bottom" 
         intensity={50} 
       />
       <BlurEffect 
         className="absolute bg-gradient-to-b from-black/40 to-transparent h-1/2 md:h-1/3 w-full top-0 z-0" 
         position="top" 
         intensity={50} 
       />
       
       {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
